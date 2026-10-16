import { Router } from "express";
import * as produtosController from "../controllers/produtoController.js";
import * as produtos from "../schemas/SchemaProdutos.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as auth from "../middlewares/authMiddleware.js";

const produtosRoutes = Router();

produtosRoutes.use(auth.accessValidator);

produtosRoutes.get(
  "/",
  validarRequisicao(produtos.listarProdutosSchema),
  produtosController.listarProdutos,
);

produtosRoutes.post(
  "/",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(produtos.criarProdutoSchema),
  produtosController.criarProduto,
);

produtosRoutes.patch(
  "/:produtoId",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(produtos.atualizarProdutoSchema),
  produtosController.atualizarProduto,
);

produtosRoutes.patch(
  "/:produtoId/estoque",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(produtos.alterarEstoqueSchema),
  produtosController.atualizarEstoque,
);

produtosRoutes.delete(
  "/:produtoId",
  auth.validarRole(["admin"]),
  validarRequisicao(produtos.produtoIdSchema),
  produtosController.excluirProduto,
);

export default produtosRoutes;