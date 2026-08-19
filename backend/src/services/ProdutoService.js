import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

const produtoSelect = {
  idProduto: true,
  nomeProduto: true,
  precoProduto: true,
  quantidadeProduto: true,
  tipoProduto: true,
  statusItem: true,
};

export default class ProdutoService extends BaseService {
  constructor() {
    super(prisma.produto, "idProduto");
  }

  async criarProduto({ nome, preco, quantidade, tipo }) {
    return super.criar(
      {
        nomeProduto: nome,
        precoProduto: preco,
        quantidadeProduto: quantidade,
        tipoProduto: tipo,
        statusItem: tipo === "armario" ? "indisponivel" : "ativo",
      },
      {
        select: produtoSelect,
      }
    );
  }

  async listarProdutos({ busca = "", arquivado = "false", tipo = "uniforme" } = {}) {
    const buscaLimpa = busca.trim();
    const statusItem = arquivado === "true" ? "arquivado" : "ativo";

    return super.listar(
      {
        tipoProduto: tipo,
        statusItem: statusItem,
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
      }
    );
  }
}