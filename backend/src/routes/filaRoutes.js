// Rotas HTTP relacionadas à fila de atendimento.
import { Router } from "express";
import { listarFila, chamarSenha } from "../controllers/filaController.js";

const filaRoutes = Router();

//* Entrega as senhas aguardando da etapa informada em ?etapa=.
filaRoutes.get("/", listarFila);

//* Reserva a senha selecionada pelo atendente.
filaRoutes.post("/chamadas", chamarSenha);

export default filaRoutes;
