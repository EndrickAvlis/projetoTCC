import { requisitarApi } from "../../../services/apiClient";

export const listarFila = async (etapa) => {
  const res = await requisitarApi(
    `/filas?etapa=${encodeURIComponent(etapa)}`
  );
  return res.senhas;
};

export const listarChamadasHoje = async (etapa) => {
  const res = await requisitarApi(
    `/filas/historico?etapa=${encodeURIComponent(etapa)}`
  );
  return res.senhas;
};

export const chamarSenha = async (senhaId, etapa) => {
  const res = await requisitarApi("/filas/chamadas", {
    method: "POST",
    body: { senhaId, etapa },
  });
  return res.senha;
};

export const alterarPrioridade = async (senhaId, tipoSenha) => {
  const res = await requisitarApi(
    `/senhas/${encodeURIComponent(senhaId)}/prioridade`,
    {
      method: "PATCH",
      body: { tipoSenha },
    }
  );
  return res.senha;
};

export const emitirSenha = async () => {
  const res = await requisitarApi("/senhas", {
    method: "POST",
  });
  return res.senha;
};