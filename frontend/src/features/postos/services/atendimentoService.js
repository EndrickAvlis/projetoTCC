import { requisitarApi } from "../../../services/apiClient";

export const iniciarAtendimento = async (senhaId) => {
  return requisitarApi("/atendimento/iniciar", {
    method: "POST",
    body: { senhaId },
  });
};

export const recuperarAtendimento = async (etapa) => {
  return requisitarApi(`/atendimento/recuperar/${encodeURIComponent(etapa)}`);
};

export const rechamarSenha = async (senhaId, etapa) => {
  return requisitarApi("/atendimento/rechamar", {
    method: "POST",
    body: { senhaId, etapa },
  });
};

export const finalizarAtendimento = async (senhaId) => {
  return requisitarApi("/atendimento/finalizar", {
    method: "POST",
    body: { senhaId },
  });
};

export const cancelarAtendimento = async (senhaId) => {
  return requisitarApi("/atendimento/cancelar", {
    method: "POST",
    body: { senhaId },
  });
};

