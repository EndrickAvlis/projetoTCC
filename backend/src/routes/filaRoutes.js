// Rotas HTTP relacionadas à fila de atendimento.
import { Router } from "express";
import * as FilaController from "../controllers/FilaController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorFila from "../validators/ValidatorFila.js";

const filaRoutes = Router();

filaRoutes.get("/", validarRequisicao(ValidatorFila.listarFilaSchema), FilaController.listarFila);

filaRoutes.post("/chamadas", validarRequisicao(ValidatorFila.chamarSenhaSchema), FilaController.chamarSenha);

export default filaRoutes;
