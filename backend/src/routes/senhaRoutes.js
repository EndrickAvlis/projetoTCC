import { Router } from "express";
import { emitirSenha } from "../controllers/senhaController.js";

const senhaRouter = Router();

senhaRouter.post("/", emitirSenha)

export default senhaRouter;