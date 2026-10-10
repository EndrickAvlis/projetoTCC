import { requisitarApi } from "../../../services/apiClient";

export const iniciarAtendimento = async (senhaId) => {
  return requisitarApi("/atendimentos/iniciar", {
    method: "POST",
    body: { senhaId },
  });
};

export const recuperarAtendimento = async (etapa) => {
  return requisitarApi(`/atendimentos/recuperar/${encodeURIComponent(etapa)}`);
};

export const rechamarSenha = async (senhaId, etapa) => {
  return requisitarApi("/atendimentos/rechamar", {
    method: "POST",
    body: { senhaId, etapa },
  });
};

export const finalizarAtendimento = async (senhaId) => {
  return requisitarApi("/atendimentos/finalizar", {
    method: "POST",
    body: { senhaId },
  });
};

export const cancelarAtendimento = async (senhaId) => {
  return requisitarApi("/atendimentos/cancelar", {
    method: "POST",
    body: { senhaId },
  });
};

