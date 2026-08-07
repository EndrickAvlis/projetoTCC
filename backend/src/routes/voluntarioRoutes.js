// Rotas HTTP relacionadas à fila de atendimento.
import { Router } from "express";
import * as VoluntarioController from "../controllers/VoluntarioController.js";

const voluntarioRoutes = Router();

//* Entrega as senhas aguardando da etapa informada em ?etapa=.
voluntarioRoutes.get("/", VoluntarioController.listarVoluntarios);
voluntarioRoutes.post("/", VoluntarioController.criarVoluntario);

export default voluntarioRoutes;
