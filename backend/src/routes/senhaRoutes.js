import { Router } from "express";
import * as senhaController from "../controllers/SenhaController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import { alterarPrioridadeSenhaSchema } from "../validators/ValidatorSenha.js";

const senhaRouter = Router();

senhaRouter.post("/", senhaController.emitirSenha)
senhaRouter.patch(
  "/:id/prioridade", validarRequisicao(alterarPrioridadeSenhaSchema), senhaController.alterarPrioridadeSenha,
)

export default senhaRouter;
