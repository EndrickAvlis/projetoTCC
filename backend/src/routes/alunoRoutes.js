import { Router } from "express";
import * as alunosController from "../controllers/AlunosController.js";
import * as alunos from "../validators/ValidatorAlunos.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";

const alunosRoutes = Router();

alunosRoutes.post(
  "/",
  validarRequisicao(alunos.criarAlunoSchema),
  alunosController.criarAluno,
);

alunosRoutes.get(
  "/",
  validarRequisicao(alunos.listarAlunosSchema),
  alunosController.listarAlunos,
);

alunosRoutes.get(
  "/:id",
  validarRequisicao(alunos.consultarAlunoSchema),
  alunosController.consultarAluno,
);

alunosRoutes.patch(
  "/:id",
  validarRequisicao(alunos.editarAlunoSchema),
  alunosController.editarAluno,
);

alunosRoutes.post(
  "/:id/matriculas",
  validarRequisicao(alunos.adicionarMatriculaSchema),
  alunosController.adicionarMatricula,
);

export default alunosRoutes;