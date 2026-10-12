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

alunoRoutes.get("/cidades", alunoController.listarCidades);

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

alunoRoutes.post(
  "/importar",
  validarRequisicao(alunos.importarAlunosSchema),
  alunoController.importarAlunos,
);

export default alunoRoutes;
