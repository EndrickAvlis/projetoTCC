// Rotas HTTP relacionadas aos voluntários.
import { Router } from "express";
import * as VoluntarioController from "../controllers/VoluntarioController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorVoluntario from "../schemas/SchemaVoluntario.js";
import * as auth from "../middlewares/authMiddleware.js";

const voluntarioRoutes = Router();

voluntarioRoutes.use(auth.accessValidator, auth.validarRole(["admin", "supervisor"]));

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
  "/:id",
  validarRequisicao(ValidatorVoluntario.atualizarVoluntarioRequisicaoSchema),
  VoluntarioController.atualizarVoluntario,
);

export default voluntarioRoutes;
