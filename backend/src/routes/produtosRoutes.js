import {Router} from "express";
import * as produtosController from "../controllers/ProdutosController.js";
import * as produtos from "../schemas/SchemaProdutos.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";

const produtosRoutes = Router();

produtosRoutes.post("/", validarRequisicao(produtos.criarProdutoSchema), produtosController.criarProdutoAdmin);

export default produtosRoutes;