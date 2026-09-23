import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";
import AppError from "../errors/AppError.js";

const produtoSelect = {
  idProduto: true,
  nomeProduto: true,
  precoProduto: true,
  quantidadeProduto: true,
  tipoProduto: true,
  statusItem: true,
};

const produtoNaoEncontrado = () =>
  new AppError("Produto não encontrado.", {
    status: 404,
    code: "PRODUTO_NAO_ENCONTRADO",
  });

const armarioNaoConfigurado = () =>
  new AppError("Armário não configurado.", {
    status: 404,
    code: "ARMARIO_NAO_CONFIGURADO",
  });

const uniformeJaCadastrado = () =>
  new AppError("Este uniforme já está cadastrado.", {
    status: 409,
    code: "UNIFORME_JA_CADASTRADO",
  });

const armarioJaConfigurado = () =>
  new AppError("O armário já está configurado.", {
    status: 409,
    code: "ARMARIO_JA_CONFIGURADO",
  });

const estoqueInsuficiente = (quantidadeDisponivel, quantidadeSolicitada) =>
  new AppError("Não foi possível alterar o estoque.", {
    status: 409,
    code: "ESTOQUE_INSUFICIENTE",
    details: {
      quantidadeDisponivel,
      quantidadeSolicitada,
    },
  });

const operacaoEstoqueNaoPermitida = () =>
  new AppError("A operação de estoque não é permitida para este produto.", {
    status: 422,
    code: "OPERACAO_ESTOQUE_NAO_PERMITIDA",
  });

const statusProdutoInvalido = () =>
  new AppError("Status inválido para este produto.", {
    status: 422,
    code: "STATUS_PRODUTO_INVALIDO",
  });

export default class ProdutoService extends BaseService {
  constructor() {
    super(prisma.produto, "idProduto");
  }

  async criarProduto({ nome, preco, quantidade, tipo }) {
    const nomeLimpo = nome.trim();

    if (tipo === "uniforme") {
      const produtoExistente = await this.obterPorNome(nomeLimpo);

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
        throw armarioJaConfigurado();
      }
    }

    return super.criar(
      {
        nomeProduto: tipo === "armario" ? "Armário" : nomeLimpo,
        precoProduto: preco,
        quantidadeProduto: quantidade,
        tipoProduto: tipo,
        statusItem: tipo === "armario" ? "indisponivel" : "ativo",
      },
      {
        select: produtoSelect,
      },
    );
  }

  async listarProdutos({
    busca = "",
    arquivado = "false",
    tipo = "uniforme",
  } = {}) {
    const buscaLimpa = busca.trim();

    const statusItem =
      arquivado === "true" ? "arquivado" : "ativo";

    return super.listar(
      {
        tipoProduto: tipo,
        statusItem,
        ...(buscaLimpa && {
          nomeProduto: {
            contains: buscaLimpa,
            mode: "insensitive",
          },
        }),
      },
      {
        select: produtoSelect,
        orderBy: {
          nomeProduto: "asc",
        },
      },
    );
  }

  async obterPorNome(nome) {
    return prisma.produto.findFirst({
      where: {
        tipoProduto: "uniforme",
        nomeProduto: nome,
      },
      select: produtoSelect,
    });
  }

  async atualizarProduto(produtoId, dados) {
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
        const nomeLimpo = dados.nome.trim();

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

    if (
      produto.tipoProduto === "armario" &&
      dados.quantidade !== undefined
    ) {
      dadosAtualizacao.quantidadeProduto = dados.quantidade;
    }

    return super.atualizar(
      produtoId,
      dadosAtualizacao,
      {
        select: produtoSelect,
      },
    );
  }

  async alterarStatusProduto(produtoId, status) {
    const produto = await super.buscarPorId(produtoId, {
      select: produtoSelect,
    });

    if (!produto) {
      throw produtoNaoEncontrado();
    }

    const statusValidos =
      produto.tipoProduto === "uniforme"
        ? ["ativo", "arquivado"]
        : ["disponivel", "indisponivel"];

    if (!statusValidos.includes(status)) {
      throw statusProdutoInvalido();
    }

    return super.atualizar(
      produtoId,
      {
        statusItem: status,
      },
      {
        select: produtoSelect,
      },
    );
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
        throw operacaoEstoqueNaoPermitida();
      }

      let novaQuantidade = produto.quantidadeProduto;

      if (operacao === "adicionar") {
        novaQuantidade += quantidade;
      }

      if (operacao === "diminuir") {
        if (quantidade > produto.quantidadeProduto) {
          throw estoqueInsuficiente(
            produto.quantidadeProduto,
            quantidade,
          );
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

  async buscarConfiguracaoArmario() {
    const produto = await prisma.produto.findFirst({
      where: {
        tipoProduto: "armario",
      },
      select: produtoSelect,
    });

    if (!produto) {
      throw armarioNaoConfigurado();
    }

    return produto;
  }
}