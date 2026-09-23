import { Router } from "express";

import * as produtosController from "../controllers/ProdutosController.js";

import * as produtos from "../validators/ValidatorProdutos.js";

import { validarRequisicao } from "../middlewares/validarRequisicao.js";

const produtosRoutes = Router();

produtosRoutes.post("/",validarRequisicao(produtos.criarProdutoSchema),produtosController.criarProdutoAdmin,);

produtosRoutes.get("/",validarRequisicao(produtos.listarProdutoSchema), produtosController.listarProdutosAdmin,);

produtosRoutes.get("/armario",produtosController.buscarConfiguracaoArmario,);

produtosRoutes.patch("/:produtoId",validarRequisicao(produtos.atualizarProdutoSchema),produtosController.atualizarProdutosAdmin,);

produtosRoutes.patch("/:produtoId/status",validarRequisicao(produtos.alterarStatusSchema),produtosController.alterarStatusProdutoAdmin,);

produtosRoutes.patch("/:produtoId/alterarEstoque",validarRequisicao(produtos.alterarEstoqueSchema),produtosController.alterarEstoqueProdutoAdmin,);

export default produtosRoutes;