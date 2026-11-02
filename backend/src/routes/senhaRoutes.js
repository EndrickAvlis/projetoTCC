import { Router } from "express";
import * as senhaController from "../controllers/senhaController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import { alterarPrioridadeSenhaSchema } from "../schemas/SchemaSenha.js";
import { accessValidator, validarRole } from "../middlewares/authMiddleware.js";

const senhaRoutes = Router();

senhaRoutes.post("/", senhaController.emitirSenha);
senhaRoutes.patch(
  "/:id/prioridade",
  accessValidator,
  validarRequisicao(alterarPrioridadeSenhaSchema),
  senhaController.alterarPrioridadeSenha,
);
senhaRoutes.get("/ultima", accessValidator, senhaController.buscarUltimaSenha);
senhaRoutes.post(
  "/reiniciar-sequencia",
  accessValidator,
  validarRole(["admin"]),
  senhaController.reiniciarSequencia,
);

export default senhaRoutes;
