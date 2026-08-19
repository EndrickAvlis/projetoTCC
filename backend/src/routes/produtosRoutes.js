import { Router } from "express";
import * as produtosController from "../controllers/ProdutosController.js";
import * as produtos from "../validators/ValidatorProdutos.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";

const produtosRoutes = Router();

produtosRoutes.post("/", validarRequisicao(produtos.criarProdutoSchema), produtosController.criarProdutoAdmin);

produtosRoutes.get("/", validarRequisicao(produtos.listarProdutoSchema), produtosController.listarProdutosAdmin);

export default produtosRoutes;