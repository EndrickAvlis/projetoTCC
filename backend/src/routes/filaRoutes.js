// Rotas HTTP relacionadas à fila de atendimento.
import { Router } from "express";
import { listarFila, chamarSenha } from "../controllers/FilaController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import {
  listarFilaSchema,
  chamarSenhaSchema,
} from "../validators/ValidatorFila.js";

const filaRoutes = Router();

filaRoutes.get("/", validarRequisicao(listarFilaSchema), listarFila);

filaRoutes.post("/chamadas", validarRequisicao(chamarSenhaSchema), chamarSenha);

export default filaRoutes;
