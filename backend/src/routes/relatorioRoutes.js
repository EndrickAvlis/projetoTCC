import { Router } from "express";
import * as relatorioController from "../controllers/relatorioController.js";
import * as auth from "../middlewares/authMiddleware.js";

const relatorioRoutes = Router();

relatorioRoutes.use(auth.accessValidator);
relatorioRoutes.use(auth.validarRole(["admin", "supervisor"]));

relatorioRoutes.get("/exportar", relatorioController.exportarVendas);
//relatorioRoutes.get("/dados", relatorioController.obterDadosRelatorio);
//relatorioRoutes.get("/detalhe/:id", relatorioController.obterDetalhesVenda);

export default relatorioRoutes;
