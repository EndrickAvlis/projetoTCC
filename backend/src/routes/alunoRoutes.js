import { Router } from "express";
import * as alunoController from "../controllers/alunoController.js";
import * as alunos from "../schemas/SchemaAlunos.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as auth from "../middlewares/authMiddleware.js";

const alunoRoutes = Router();

alunoRoutes.use(auth.accessValidator);

alunoRoutes.get(
  "/",
  validarRequisicao(alunos.listarAlunosSchema),
  alunoController.listarAlunos,
);

alunoRoutes.get("/cidades", alunoController.listarCidades);

alunoRoutes.patch(
  "/:id",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(alunos.atualizarAlunoSchema),
  alunoController.atualizarAluno,
);

alunoRoutes.post(
  "/importar",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(alunos.importarAlunosSchema),
  alunoController.importarAlunos,
);

export default alunoRoutes;

