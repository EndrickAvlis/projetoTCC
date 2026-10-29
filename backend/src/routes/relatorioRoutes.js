import { Router } from "express";
import * as relatorioController from "../controllers/relatorioController.js";
import * as auth from "../middlewares/authMiddleware.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import {
  obterDadosRelatorioSchema,
  exportarRelatorioSchema,
  detalheRelatorioSchema,
} from "../schemas/SchemaRelatorio.js";

const relatorioRoutes = Router();

relatorioRoutes.use(auth.accessValidator);
relatorioRoutes.use(auth.validarRole(["admin", "supervisor"]));

relatorioRoutes.get(
  "/dados",
  validarRequisicao(obterDadosRelatorioSchema),
  relatorioController.obterDadosRelatorio,
);

relatorioRoutes.get(
  "/detalhe/:id",
  validarRequisicao(detalheRelatorioSchema),
  relatorioController.obterDetalhesVenda,
);

relatorioRoutes.get(
  "/exportar",
  validarRequisicao(exportarRelatorioSchema),
  relatorioController.exportarVendas,
);

export default relatorioRoutes;
