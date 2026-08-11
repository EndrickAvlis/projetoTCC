// Rotas HTTP relacionadas à fila de atendimento.
import { Router } from "express";
import * as VoluntarioController from "../controllers/VoluntarioController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as Schema from "../validators/ValidatorVoluntario.js";

const voluntarioRoutes = Router();

//* Entrega as senhas aguardando da etapa informada em ?etapa=.
voluntarioRoutes.get(
  "/",
  validarRequisicao(Schema.listarVoluntarioSchema),
  VoluntarioController.listarVoluntarios,
);
voluntarioRoutes.post(
  "/",
  validarRequisicao(Schema.criarVoluntarioSchema),
  VoluntarioController.criarVoluntario,
);
voluntarioRoutes.patch(
  "/:idVoluntario",
  validarRequisicao(Schema.atualizarVoluntarioSchema),
  VoluntarioController.atualizarVoluntario,
);

export default voluntarioRoutes;
