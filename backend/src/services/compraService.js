import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import BaseService from "./baseService.js";

const arredondarMoeda = (valor) => Math.round(valor * 100) / 100;

export default class CompraService extends BaseService {
  constructor() {
    super(prisma.compra, "idCompra");
  }

  async registrarCompra(
    codVoluntario,
    codAluno,
    itens = [],
    pagamentos = [],
    contribuicao = 0,
  ) {
    if (itens.length === 0 && contribuicao <= 0) {
      throw new AppError(
        "A compra deve possuir ao menos um item ou contribuição.",
        {
          status: 400,
          code: "COMPRA_VAZIA",
        },
      );
    }

    return prisma.$transaction(async (tx) => {
      const aluno = await tx.aluno.findUnique({
        where: { idAluno: codAluno },
      });

      if (!aluno) {
        throw new AppError("Aluno não encontrado.", {
          status: 404,
          code: "ALUNO_NAO_ENCONTRADO",
        });
      }

      const idsProdutos = itens.map((item) => item.produtoId);
      const produtos =
        idsProdutos.length > 0
          ? await tx.produto.findMany({
              where: {
                idProduto: { in: idsProdutos },
                statusProduto: true,
              },
            })
          : [];

      if (produtos.length !== itens.length) {
        throw new AppError(
          "Um ou mais produtos não foram encontrados ou estão inativos.",
          {
            status: 404,
            code: "PRODUTO_NAO_ENCONTRADO",
          },
        );
      }

      const valorItens = itens.reduce((totalAcumulado, item) => {
        const produtoDoItem = produtos.find(
          (p) => p.idProduto === item.produtoId,
        );

        if (item.quantidadeRetirada > produtoDoItem.quantidadeProduto) {
          throw new AppError(
            `Estoque insuficiente para o produto ${produtoDoItem.nomeProduto}.`,
            {
              status: 400,
              code: "ESTOQUE_INSUFICIENTE",
            },
          );
        }

        const subtotal = arredondarMoeda(
          Number(produtoDoItem.precoProduto) * item.quantidade,
        );

        return arredondarMoeda(totalAcumulado + subtotal);
      }, 0);

      const valorTotal = arredondarMoeda(Number(contribuicao) + valorItens);
      const valorTotalPago = arredondarMoeda(
        pagamentos.reduce(
          (totalPago, pagamento) => totalPago + Number(pagamento.valor),
          0,
        ),
      );

      if (valorTotal !== valorTotalPago) {
        throw new AppError("O total pago diverge do valor da compra.", {
          status: 400,
          code: "PAGAMENTO_DIVERGENTE",
        });
      }

      const codigoDeRetirada = await gerarCodigo(tx);
      const agora = new Date();

      const compra = await tx.compra.create({
        data: {
          codVoluntario,
          codAluno,
          valorCompra: valorTotal,
          dataHoraCompra: agora,
          codigoRetirada: codigoDeRetirada,
        },
      });

      for (const item of itens) {
        const produtoDoItem = produtos.find(
          (p) => p.idProduto === item.produtoId,
        );

        await tx.itemCompra.create({
          data: {
            codProduto: produtoDoItem.idProduto,
            codCompra: compra.idCompra,
            precoUnitario: produtoDoItem.precoProduto,
            quantidadeItem: item.quantidade,
            quantidadeRetiradaItem: item.quantidadeRetirada,
            statusItem:
              item.quantidadeRetirada === item.quantidade
                ? "retirado"
                : item.quantidadeRetirada === 0
                  ? "pendente"
                  : "parcial",
          },
        });

        if (item.quantidadeRetirada > 0) {
          await tx.produto.update({
            where: { idProduto: produtoDoItem.idProduto },
            data: {
              quantidadeProduto: {
                decrement: item.quantidadeRetirada,
              },
            },
          });
        }
      }

      for (const pagamento of pagamentos) {
        if (pagamento.valor > 0) {
          await tx.pagamento.create({
            data: {
              codCompra: compra.idCompra,
              valorPagamento: pagamento.valor,
              tipoPagamento: pagamento.tipo,
            },
          });
        }
      }

      if (contribuicao > 0) {
        await tx.contribuicao.create({
          data: {
            codCompra: compra.idCompra,
            valorContribuicao: contribuicao,
            dataHora: agora,
          },
        });
      }

      return {
        sucesso: true,
        mensagem: "Compra registrada com sucesso.",
        codigoDeRetirada,
      };
    });
  }
}

async function gerarCodigo(tx) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  let existente = null;

  do {
    const randomPart = Array.from(
      { length: 7 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");

    codigo = `RET-${randomPart}`;

    existente = await tx.compra.findFirst({
      where: { codigoRetirada: codigo },
      select: { idCompra: true },
    });
  } while (existente);

  return codigo;
}
