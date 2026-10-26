import { Router } from "express";
import * as cursoController from "../controllers/cursoController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as cursos from "../schemas/SchemaCursos.js";
import * as auth from "../middlewares/authMiddleware.js";

const cursoRoutes = Router();

cursoRoutes.use(auth.accessValidator);

cursoRoutes.get(
  "/",
  validarRequisicao(cursos.listarCursosSchema),
  cursoController.listarCursos,
);

cursoRoutes.post(
  "/",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(cursos.criarCursoSchema),
  cursoController.criarCurso,
);

cursoRoutes.patch(
  "/:cursoId",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(cursos.atualizarCursoSchema),
  cursoController.atualizarCurso,
);

cursoRoutes.post(
  "/:cursoId/periodos",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(cursos.criarPeriodoSchema),
  cursoController.criarPeriodo,
);

cursoRoutes.patch(
  "/:cursoId/periodos/:periodoId",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(cursos.atualizarPeriodoSchema),
  cursoController.atualizarPeriodo,
);

cursoRoutes.delete(
  "/:cursoId",
  auth.validarRole(["admin"]),
  validarRequisicao(cursos.excluirCursoSchema),
  cursoController.excluirCurso,
);

export default cursoRoutes;

