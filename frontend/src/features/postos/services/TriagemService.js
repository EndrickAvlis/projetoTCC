import { requisitarApi } from "../../../services/apiClient";

export const buscarAlunos = async (nome, limite = 10) => {
  const query = new URLSearchParams({ nome, limite: String(limite) });
  const res = await requisitarApi(`/alunos?${query.toString()}`);
  return res?.alunos ?? [];
};

export const criarAluno = async (dados) => {
  return requisitarApi("/alunos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
};

export const salvarDados = async (senhaId, payload) => {
  return requisitarApi(`/senhas/${encodeURIComponent(senhaId)}/aluno`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const iniciarAtendimento = async (senhaId) => {
  return requisitarApi("/atendimentos", {
    method: "POST",
    body: JSON.stringify({ senhaId }),
  });
};

export const rechamarSenha = async (senhaId) => {
  return requisitarApi(
    `/filas/chamadas/${encodeURIComponent(senhaId)}/rechamadas`,
    {
      method: "POST",
      body: JSON.stringify({ etapa: "triagem" }),
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
      body: JSON.stringify({ documentos }),
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
      body: JSON.stringify({ etapa: "triagem" }),
    },
  );
};

export const alterarPrioridadeSenha = async (senhaId, tipoSenha) => {
  return requisitarApi(`/senhas/${encodeURIComponent(senhaId)}/prioridade`, {
    method: "PATCH",
    body: JSON.stringify({ tipoSenha }),
  });
};
