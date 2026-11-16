import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import BaseService from "./baseService.js";

const pendenteWhere = {
  statusItem: { in: ["pendente", "parcial"] },
  produto: { tipoProduto: "uniforme" },
};

const quantidadePendente = (item) =>
  item.quantidadeItem - item.quantidadeRetiradaItem;

const mapearCompra = (compra) => {
  const matricula = compra.aluno.cursosAluno[0];

  return {
    id: compra.idCompra,
    codigoRetirada: compra.codigoRetirada,
    dataHora: compra.dataHoraCompra,
    quantidadePendente: compra.itensCompra
      .filter((item) => item.statusItem !== "retirado")
      .reduce((total, item) => total + quantidadePendente(item), 0),
    aluno: {
      nome: compra.aluno.nomeAluno,
      curso: matricula?.curso.nomeCurso ?? null,
      periodo: matricula?.periodo ?? null,
      anoEscolar: matricula?.anoEscolar ?? null,
    },
    itens: compra.itensCompra.map((item) => ({
      produtoId: item.codProduto,
      nome: item.produto.nomeProduto,
      quantidadeComprada: item.quantidadeItem,
      quantidadeRetirada: item.quantidadeRetiradaItem,
      quantidadePendente: quantidadePendente(item),
      estoque: item.produto.quantidadeProduto,
    })),
  };
};

const montarFiltros = ({ busca, cursoId }) => ({
  itensCompra: { some: pendenteWhere },
  ...(busca && {
    OR: [
      { codigoRetirada: { contains: busca, mode: "insensitive" } },
      { aluno: { nomeAluno: { contains: busca, mode: "insensitive" } } },
    ],
  }),
  ...(cursoId && {
    aluno: { cursosAluno: { some: { codCurso: cursoId } } },
  }),
});

export default class SecretariaService extends BaseService {
  constructor() {
    super(prisma.compra, "idCompra");
  }

  async obterKpis() {
    const [comprasPendentes, itens] = await Promise.all([
      this.model.count({ where: montarFiltros({}) }),
      prisma.itemCompra.findMany({
        where: pendenteWhere,
        select: { quantidadeItem: true, quantidadeRetiradaItem: true },
      }),
    ]);

    return {
      comprasPendentes,
      itensPendentes: itens.reduce(
        (total, item) => total + quantidadePendente(item),
        0,
      ),
    };
  }

  async listarPendencias({ busca, cursoId, pagina, limite }) {
    const where = montarFiltros({ busca, cursoId });

    const [total, compras] = await Promise.all([
      this.model.count({ where }),
      this.model.findMany({
        where,
        orderBy: { dataHoraCompra: "asc" },
        skip: (pagina - 1) * limite,
        take: limite,
        include: {
          aluno: {
            include: {
              cursosAluno: { include: { curso: true }, take: 1 },
            },
          },
          itensCompra: {
            where: { produto: { tipoProduto: "uniforme" } },
            include: { produto: true },
            orderBy: { codProduto: "asc" },
          },
        },
      }),
    ]);

    return {
      compras: compras.map(mapearCompra),
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async registrarRetirada(compraId, itens) {
    return prisma.$transaction(async (tx) => {
      for (const { produtoId, quantidade } of itens) {
        const item = await tx.itemCompra.findUnique({
          where: {
            codProduto_codCompra: { codProduto: produtoId, codCompra: compraId },
          },
          include: { produto: true },
        });

        if (!item || item.produto.tipoProduto !== "uniforme") {
          throw new AppError("Item não encontrado nesta compra.", {
            status: 404,
            code: "ITEM_COMPRA_NAO_ENCONTRADO",
          });
        }

        if (quantidade > quantidadePendente(item)) {
          throw new AppError(
            `A quantidade excede o pendente do uniforme ${item.produto.nomeProduto}.`,
            { status: 409, code: "QUANTIDADE_ACIMA_DO_PENDENTE" },
          );
        }

        const { count } = await tx.produto.updateMany({
          where: { idProduto: produtoId, quantidadeProduto: { gte: quantidade } },
          data: { quantidadeProduto: { decrement: quantidade } },
        });

        if (count === 0) {
          throw new AppError(
            `Estoque insuficiente para o uniforme ${item.produto.nomeProduto}.`,
            { status: 409, code: "ESTOQUE_INSUFICIENTE" },
          );
        }

        const totalRetirado = item.quantidadeRetiradaItem + quantidade;

        await tx.itemCompra.update({
          where: {
            codProduto_codCompra: { codProduto: produtoId, codCompra: compraId },
          },
          data: {
            quantidadeRetiradaItem: totalRetirado,
            statusItem:
              totalRetirado === item.quantidadeItem ? "retirado" : "parcial",
          },
        });
      }

      return { mensagem: "Retirada registrada com sucesso." };
    });
  }
}
