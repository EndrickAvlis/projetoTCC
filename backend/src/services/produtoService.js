import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
import AppError from "../errors/AppError.js";

const produtoSelect = {
  idProduto: true,
  nomeProduto: true,
  precoProduto: true,
  quantidadeProduto: true,
  tipoProduto: true,
  statusProduto: true,
};

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
    const nomeLimpo = tipo === "armario" ? "Armário" : nome.trim().toUpperCase();

    if (tipo === "uniforme") {
      const produtoExistente = await prisma.produto.findFirst({
        where: {
          tipoProduto: "uniforme",
          nomeProduto: nomeLimpo,
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
        nomeProduto: nomeLimpo,
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
        const nomeLimpo = dados.nome.trim().toUpperCase();

        const produtoExistente = await prisma.produto.findFirst({
          where: {
            tipoProduto: "uniforme",
            nomeProduto: nomeLimpo,
            idProduto: {
              not: produtoId,
            },
          },
        });

        if (produtoExistente) {
          throw uniformeJaCadastrado();
        }

        dados.nome = nomeLimpo;
      }
    }

    if (produto.tipoProduto === "armario") {
      if (dados.nome !== undefined) {
        throw new AppError("Não é possível alterar o nome do armário.", {
          status: 400,
          code: "DADOS_INVALIDOS",
        });
      }
    }

    const dadosAtualizacao = {};

    if (dados.nome !== undefined) {
      dadosAtualizacao.nomeProduto = dados.nome;
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

    return super.atualizar(produtoId, dadosAtualizacao, {
      select: produtoSelect,
    });
  }

  async alterarEstoque(produtoId, operacao, quantidade) {
    return prisma.$transaction(async (transacao) => {
      const produto = await transacao.produto.findUnique({
        where: {
          idProduto: produtoId,
        },
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
      }

      if (operacao === "diminuir") {
        if (quantidade > produto.quantidadeProduto) {
          throw new AppError("Não foi possível alterar o estoque.", {
            status: 409,
            code: "ESTOQUE_INSUFICIENTE",
            details: {
              quantidadeDisponivel: produto.quantidadeProduto,
              quantidadeSolicitada: quantidade,
            },
          });
        }

        novaQuantidade -= quantidade;
      }

      if (operacao === "corrigir") {
        novaQuantidade = quantidade;
      }

      return transacao.produto.update({
        where: {
          idProduto: produtoId,
        },
        data: {
          quantidadeProduto: novaQuantidade,
        },
        select: produtoSelect,
      });
    });
  }

  async excluir(produtoId) {
    const produto = await super.buscarPorId(produtoId, {
      select: produtoSelect,
    });

    if (!produto) {
      throw produtoNaoEncontrado();
    }

    if (produto.statusProduto) {
      throw new AppError(
        "Apenas produtos desativados ou arquivados podem ser excluídos.",
        {
          status: 400,
          code: "PRODUTO_ATIVO",
        },
      );
    }

    return prisma.$transaction(async (tx) => {
      await tx.itemCompra.deleteMany({
        where: { codProduto: produtoId },
      });

      return tx.produto.delete({
        where: { idProduto: produtoId },
        select: produtoSelect,
      });
    });
  }
}
