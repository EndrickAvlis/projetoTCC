import { requisitarApi } from "../../../services/apiClient";

export const listarAlunos = (nome, limite = 10) => {
  const query = new URLSearchParams({ nome, limite: String(limite) });
  return requisitarApi(`/alunos?${query.toString()}`);
};

export const salvarAluno = (senhaId, payload) =>
  requisitarApi(`/senhas/${encodeURIComponent(senhaId)}/aluno`, {
    method: "PUT",
    body: payload,
  });

export const listarCursos = () => requisitarApi("/cursos");

export const listarPendencias = () =>
  requisitarApi("triagem/filas/pendencias?etapa=triagem");

export const registrarPendencia = (atendimentoId, documentos) =>
  requisitarApi("/pendencias", {
    method: "POST",
    body: { atendimentoId, documentos },
  });

export const retomarPendencia = (senhaId, etapa = "triagem") =>
  requisitarApi("/pendencias/retomar", {
    method: "POST",
    body: { senhaId, etapa },
  });
