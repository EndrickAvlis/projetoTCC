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
        statusItem: "ativo",
      },
      {
        select: produtoSelect,
      },
    );
  }



}
