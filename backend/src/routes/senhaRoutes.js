import { Router } from "express";
import { emitirSenha } from "../controllers/senhaController.js";
import * as VoluntarioController from "../controllers/VoluntarioController.js";

const senhaRouter = Router();

//senhaRouter.post("/", emitirSenha)
senhaRouter.get("/", VoluntarioController.listarVoluntarios)

export default senhaRouter;