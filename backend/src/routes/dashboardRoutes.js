import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import * as auth from "../middlewares/authMiddleware.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import { obterDashboardSchema } from "../schemas/SchemaDashboard.js";

const dashboardRoutes = Router();

dashboardRoutes.use(auth.accessValidator);
dashboardRoutes.use(auth.validarRole(["admin", "supervisor"]));
dashboardRoutes.get("/", validarRequisicao(obterDashboardSchema), dashboardController.obterDashboard);

export default dashboardRoutes;
