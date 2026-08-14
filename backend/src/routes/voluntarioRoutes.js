// Rotas HTTP relacionadas à fila de atendimento.
import { Router } from "express";
import * as VoluntarioController from "../controllers/VoluntarioController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorVoluntario from "../validators/ValidatorVoluntario.js";

const voluntarioRoutes = Router();

//* Entrega as senhas aguardando da etapa informada em ?etapa=.
voluntarioRoutes.get(
  "/",
  validarRequisicao(ValidatorVoluntario.listarVoluntariosSchema),
  VoluntarioController.listarVoluntarios,
);
voluntarioRoutes.post(
  "/",
  validarRequisicao(ValidatorVoluntario.criarVoluntarioRequisicaoSchema),
  VoluntarioController.criarVoluntario,
);
voluntarioRoutes.patch(
  "/:idVoluntario",
  validarRequisicao(ValidatorVoluntario.atualizarVoluntarioRequisicaoSchema),
  VoluntarioController.atualizarVoluntario,
);

export default voluntarioRoutes;
