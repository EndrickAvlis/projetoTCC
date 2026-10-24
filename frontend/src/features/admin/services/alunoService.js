import { requisitarApi } from "../../../services/apiClient";

export const listarAlunos = (params) =>
  requisitarApi("/alunos", { params });

export const listarCidades = () =>
  requisitarApi("/alunos/cidades");

export const atualizarAluno = (alunoId, dados) =>
  requisitarApi(`/alunos/${alunoId}`, {
    method: "PATCH",
    body: dados,
  });

export const importarAlunos = (dados) =>
  requisitarApi("/alunos/importar", {
    method: "POST",
    body: dados,
  });

