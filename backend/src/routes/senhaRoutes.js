import { Router } from "express";
import * as senhaController from "../controllers/senhaController.js";

const senhaRouter = Router();

senhaRouter.post("/", senhaController.emitirSenha)
senhaRouter.patch("/:id/prioridade", senhaController.alterarPrioridadeSenha)

export default senhaRouter;
