import { Router } from "express";
import * as senhaController from "../controllers/senhaController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import { alterarPrioridadeSenhaSchema } from "../schemas/SchemaSenha.js";
import { accessValidator, validarRole } from "../middlewares/authMiddleware.js";

const senhaRouter = Router();

senhaRouter.post("/", senhaController.emitirSenha);
senhaRouter.patch(
  "/:id/prioridade",
  validarRequisicao(alterarPrioridadeSenhaSchema),
  senhaController.alterarPrioridadeSenha,
);
senhaRouter.get("/ultima", accessValidator, senhaController.buscarUltimaSenha);
senhaRouter.post(
  "/reiniciar-sequencia",
  accessValidator,
  validarRole(["admin"]),
  senhaController.reiniciarSequencia,
);

export default senhaRouter;
