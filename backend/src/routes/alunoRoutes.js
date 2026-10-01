import { Router } from "express";
import * as alunoController from "../controllers/alunoController.js";
import * as alunos from "../schemas/SchemaAlunos.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";

const alunoRoutes = Router();

alunoRoutes.post(
  "/",
  validarRequisicao(alunos.criarAlunoSchema),
  alunoController.criarAluno,
);

alunoRoutes.get(
  "/",
  validarRequisicao(alunos.listarAlunosSchema),
  alunoController.listarAlunos,
);

alunoRoutes.get(
  "/:id",
  validarRequisicao(alunos.consultarAlunoSchema),
  alunoController.consultarAluno,
);

alunoRoutes.patch(
  "/:id",
  validarRequisicao(alunos.editarAlunoSchema),
  alunoController.editarAluno,
);

alunoRoutes.post(
  "/:id/matriculas",
  validarRequisicao(alunos.adicionarMatriculaSchema),
  alunoController.adicionarMatricula,
);

export default alunoRoutes;