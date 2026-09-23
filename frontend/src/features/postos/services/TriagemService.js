import { requisitarApi } from "../../../services/apiClient";

export const buscarAlunos = async (nome, limite = 10) => {
  const query = new URLSearchParams({ nome, limite: String(limite) });
  const res = await requisitarApi(`/alunos?${query.toString()}`);
  return res?.alunos ?? [];
};

export const criarAluno = async (dados) => {
  return requisitarApi("/alunos", {
    method: "POST",
    body: dados,
  });
};

export const salvarDados = async (senhaId, payload) => {
  return requisitarApi(`/senhas/${encodeURIComponent(senhaId)}/aluno`, {
    method: "PUT",
    body: payload,
  });
};

export const recuperarAtendimentoAtual = async () => {
  return requisitarApi("/filas/atual?etapa=triagem");
};

export const iniciarAtendimento = async (senhaId) => {
  return requisitarApi("/atendimentos", {
    method: "POST",
    body: senhaId,
  });
};

export const rechamarSenha = async (senhaId) => {
  return requisitarApi(
    `/filas/chamadas/${encodeURIComponent(senhaId)}/rechamadas`,
    {
      method: "POST",
      body: { etapa: "triagem" },
    },
  );
};

export const finalizarAtendimento = async (atendimentoId) => {
  return requisitarApi(
    `/atendimentos/${encodeURIComponent(atendimentoId)}/finalizar`,
    {
      method: "POST",
    },
  );
};

export const salvarPendencia = async (atendimentoId, documentos) => {
  return requisitarApi(
    `/atendimentos/${encodeURIComponent(atendimentoId)}/pendencias`,
    {
      method: "POST",
      body: documentos,
    },
  );
};

export const listarPendencias = async () => {
  const res = await requisitarApi("/filas/pendencias?etapa=triagem");
  return {
    pendencias: res?.pendencias ?? [],
    total: res?.total ?? 0,
  };
};

export const retomarPendencia = async (senhaId) => {
  return requisitarApi(
    `/filas/pendencias/${encodeURIComponent(senhaId)}/retomadas`,
    {
      method: "POST",
      body: { etapa: "triagem" },
    },
  );
};

export const alterarPrioridadeSenha = async (senhaId, tipoSenha) => {
  return requisitarApi(`/senhas/${encodeURIComponent(senhaId)}/prioridade`, {
    method: "PATCH",
    body: tipoSenha,
  });
};

export const listarCursos = async () => {
  const resposta = await requisitarApi("/cursos");
  return resposta?.cursos ?? resposta ?? [];
};
