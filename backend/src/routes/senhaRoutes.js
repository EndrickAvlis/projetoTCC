import { Router } from "express";
import { emitirSenha, alterarPrioridadeSenha } from "../controllers/senhaController.js";

const senhaRouter = Router();

senhaRouter.post("/", emitirSenha)
senhaRouter.patch("/:id/prioridade", alterarPrioridadeSenha)

export default senhaRouter;
