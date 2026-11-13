import { Router } from "express";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorCompra from "../schemas/SchemaCompra.js";
import * as auth from "../middlewares/authMiddleware.js";
import * as CompraController from "../controllers/compraController.js";

const compraRoutes = Router();

compraRoutes.use(
  auth.accessValidator,
  auth.validarRole(["admin", "supervisor", "atendente"]),
);

compraRoutes.post(
  "/",
  validarRequisicao(ValidatorCompra.compraSchema),
  CompraController.registrarCompra,
);

export default compraRoutes;
