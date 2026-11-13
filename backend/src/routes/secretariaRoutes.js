import { Router } from "express";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorSecretaria from "../schemas/SchemaSecretaria.js";
import * as auth from "../middlewares/authMiddleware.js";
import * as SecretariaController from "../controllers/secretariaController.js";

const secretariaRoutes = Router();

secretariaRoutes.use(
  auth.accessValidator,
  auth.validarRole(["admin", "supervisor", "atendente"]),
);

secretariaRoutes.get("/", SecretariaController.obterKpis);

secretariaRoutes.get(
  "/pendencias",
  validarRequisicao(ValidatorSecretaria.listarPendenciasSchema),
  SecretariaController.listarPendencias,
);

secretariaRoutes.post(
  "/retiradas/:compraId",
  validarRequisicao(ValidatorSecretaria.registrarRetiradaSchema),
  SecretariaController.registrarRetirada,
);

export default secretariaRoutes;
