import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
import AppError from "../errors/AppError.js";

const ESTOQUE_MAXIMO = 99999;

const produtoSelect = {
  idProduto: true,
  nomeProduto: true,
  precoProduto: true,
  quantidadeProduto: true,
  tipoProduto: true,
  statusProduto: true,
};

export default class ProdutoService extends BaseService {
  constructor() {
    super(prisma.produto, "idProduto");
  }

  async listar({ busca = "", tipo, status } = {}) {
    const buscaLimpa = busca?.trim();

    return super.listar(
      {
        tipoProduto: tipo,
        statusProduto: status,
        nomeProduto: buscaLimpa
          ? { contains: buscaLimpa, mode: "insensitive" }
          : undefined,
      },
      {
        select: produtoSelect,
        orderBy: {
          nomeProduto: "asc",
        },
      },
    );
  }

  async criar({ nome, preco, quantidade, tipo, status = true }) {
    const nomeProduto =
      tipo === "armario" ? "Armário" : nome.trim().toUpperCase();

    if (tipo === "uniforme") {
      const produtoExistente = await prisma.produto.findFirst({
        where: {
          tipoProduto: "uniforme",
          nomeProduto,
        },
      });

      if (produtoExistente) {
        throw uniformeJaCadastrado();
      }
    }

    if (tipo === "armario") {
      const armarioExistente = await prisma.produto.findFirst({
        where: {
          tipoProduto: "armario",
        },
      });

      if (armarioExistente) {
        throw new AppError("O armário já está configurado.", {
          status: 409,
          code: "ARMARIO_JA_CONFIGURADO",
        });
      }
    }

    return super.criar(
      {
        nomeProduto,
        precoProduto: preco,
        quantidadeProduto: quantidade,
        tipoProduto: tipo,
        statusProduto: status,
      },
      {
        select: produtoSelect,
      },
    );
  }

  async atualizar(produtoId, dados) {
    const produto = await super.buscarPorId(produtoId, {
      select: produtoSelect,
    });

    if (!produto) {
      throw produtoNaoEncontrado();
    }

    const dadosAtualizacao = {};

    if (produto.tipoProduto === "uniforme") {
      if (dados.quantidade !== undefined) {
        throw new AppError(
          "A quantidade do uniforme deve ser alterada pelo estoque.",
          {
            status: 400,
            code: "DADOS_INVALIDOS",
          },
        );
      }

      if (dados.nome !== undefined) {
        const nomeProduto = dados.nome.trim().toUpperCase();

        if (nomeProduto !== produto.nomeProduto) {
          const produtoExistente = await prisma.produto.findFirst({
            where: {
              tipoProduto: "uniforme",
              nomeProduto,
              idProduto: {
                not: produtoId,
              },
            },
          });

          if (produtoExistente) {
            throw uniformeJaCadastrado();
          }
        }

        dadosAtualizacao.nomeProduto = nomeProduto;
      }
    }

    if (produto.tipoProduto === "armario" && dados.nome !== undefined) {
      throw new AppError("Não é possível alterar o nome do armário.", {
        status: 400,
        code: "DADOS_INVALIDOS",
      });
    }

    if (dados.preco !== undefined) {
      dadosAtualizacao.precoProduto = dados.preco;
    }

    if (produto.tipoProduto === "armario" && dados.quantidade !== undefined) {
      dadosAtualizacao.quantidadeProduto = dados.quantidade;
    }

    if (dados.status !== undefined) {
      dadosAtualizacao.statusProduto = dados.status;
    }

    return this.model.update({
      where: { idProduto: produtoId },
      data: dadosAtualizacao,
      select: produtoSelect,
    });
  }

  async atualizarEstoque(produtoId, operacao, quantidade) {
    const produto = await super.buscarPorId(produtoId, {
      select: produtoSelect,
    });

    if (!produto) {
      throw produtoNaoEncontrado();
    }

    if (produto.tipoProduto !== "uniforme") {
      throw new AppError(
        "A operação de estoque não é permitida para este produto.",
        {
          status: 422,
          code: "OPERACAO_ESTOQUE_NAO_PERMITIDA",
        },
      );
    }

    let novaQuantidade = produto.quantidadeProduto;

    if (operacao === "adicionar") {
      novaQuantidade += quantidade;

      if (novaQuantidade > ESTOQUE_MAXIMO) {
        throw new AppError(
          "O estoque final não pode exceder 99.999 unidades.",
          {
            status: 400,
            code: "ESTOQUE_MAXIMO_EXCEDIDO",
          },
        );
      }
    } else if (operacao === "diminuir") {
      if (quantidade > produto.quantidadeProduto) {
        throw new AppError("Estoque insuficiente para realizar a baixa.", {
          status: 409,
          code: "ESTOQUE_INSUFICIENTE",
          details: {
            quantidadeDisponivel: produto.quantidadeProduto,
            quantidadeSolicitada: quantidade,
          },
        });
      }

      novaQuantidade -= quantidade;
    } else if (operacao === "corrigir") {
      novaQuantidade = quantidade;
    }

    return this.model.update({
      where: { idProduto: produtoId },
      data: { quantidadeProduto: novaQuantidade },
      select: produtoSelect,
    });
  }
}

const produtoNaoEncontrado = () =>
  new AppError("Produto não encontrado.", {
    status: 404,
    code: "PRODUTO_NAO_ENCONTRADO",
  });

const uniformeJaCadastrado = () =>
  new AppError("Este uniforme já está cadastrado.", {
    status: 409,
    code: "UNIFORME_JA_CADASTRADO",
  });
