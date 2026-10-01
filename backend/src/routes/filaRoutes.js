// Rotas HTTP relacionadas à fila de atendimento.
import { Router } from "express";
import * as FilaController from "../controllers/filaController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorFila from "../schemas/SchemaFila.js";
import * as auth from "../middlewares/authMiddleware.js";

const filaRoutes = Router();

//filaRoutes.use(auth.accessValidator, auth.validarRole(["admin", "supervisor", "atendente"]));

filaRoutes.get("/", validarRequisicao(ValidatorFila.listarFilaSchema), FilaController.listarFila);

filaRoutes.post("/chamadas", validarRequisicao(ValidatorFila.chamarSenhaSchema), FilaController.chamarSenha);

export default filaRoutes;
