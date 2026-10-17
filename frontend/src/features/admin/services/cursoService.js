import { requisitarApi } from "../../../services/apiClient";

export const listarCursos = (params) =>
  requisitarApi("/cursos", { params });

export const criarCurso = (dados) =>
  requisitarApi("/cursos", {
    method: "POST",
    body: dados,
  });

export const atualizarCurso = (cursoId, dados) =>
  requisitarApi(`/cursos/${cursoId}`, {
    method: "PATCH",
    body: dados,
  });

export const criarPeriodo = (cursoId, dados) =>
  requisitarApi(`/cursos/${cursoId}/periodos`, {
    method: "POST",
    body: dados,
  });

export const atualizarPeriodo = (cursoId, periodoId, dados) =>
  requisitarApi(`/cursos/${cursoId}/periodos/${periodoId}`, {
    method: "PATCH",
    body: dados,
  });

export const excluirCurso = (cursoId) =>
  requisitarApi(`/cursos/${cursoId}`, {
    method: "DELETE",
  });


