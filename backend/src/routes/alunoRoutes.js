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
  "/arquivar",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(alunos.arquivarCandidatosSchema),
  alunoController.arquivarCandidatos,
);

alunoRoutes.patch(
  "/:id",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(alunos.atualizarAlunoSchema),
  alunoController.atualizarAluno,
);

alunoRoutes.delete(
  "/",
  auth.validarRole(["admin", "supervisor"]),
  alunoController.excluirAlunos,
);

alunoRoutes.delete(
  "/:id",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(alunos.excluirAlunoSchema),
  alunoController.excluirAluno,
);

alunoRoutes.post(
  "/importar",
  auth.validarRole(["admin", "supervisor"]),
  validarRequisicao(alunos.importarAlunosSchema),
  alunoController.importarAlunos,
);

export default alunoRoutes;

