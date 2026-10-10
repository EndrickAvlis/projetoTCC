import { requisitarApi } from "../../../services/apiClient";

export const listarAlunos = (nome, limite = 10) => {
  const query = new URLSearchParams({ nome, limite: String(limite) });
  return requisitarApi(`/alunos?${query.toString()}`);
};

export const criarAluno = (dados) =>
  requisitarApi("/alunos", {
    method: "POST",
    body: dados,
  });

export const salvarAluno = (senhaId, payload) =>
  requisitarApi(`/senhas/${encodeURIComponent(senhaId)}/aluno`, {
    method: "PUT",
    body: payload,
  });

export const listarCursos = () => requisitarApi("/cursos");

export const listarPendencias = () =>
  requisitarApi("/filas/pendencias?etapa=triagem");

export const registrarPendencia = (atendimentoId, documentos) =>
  requisitarApi(
    `/atendimentos/${encodeURIComponent(atendimentoId)}/pendencias`,
    {
      method: "POST",
      body: { documentos },
    },
  );

export const retomarPendencia = (senhaId, etapa = "triagem") =>
  requisitarApi("/atendimento/retomar", {
    method: "POST",
    body: { senhaId, etapa },
  });
