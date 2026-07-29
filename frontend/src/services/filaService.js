// Serviço de fila: chama os endpoints e adapta a senha da API para a interface.
import { requisitarApi } from "./apiClient";

const formatarHorario = (dataIso) => {
  if (!dataIso) return "";

  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
};

export const normalizarSenha = (senha) => {
  if (!senha) return null;

  return {
    ...senha,
    numero: senha.codigo ?? senha.numero ?? "",
    horario: formatarHorario(
      senha.chamadaEm ?? senha.emitidaEm ?? senha.horario,
    ),
    etapa: senha.etapaAtual ?? senha.etapa,
  };
};

export const listarFila = async (etapa) => {
  const resposta = await requisitarApi(
    `/filas?etapa=${encodeURIComponent(etapa)}`,
  );
  const senhas = resposta?.senhas ?? resposta ?? [];
  return senhas.map(normalizarSenha);
};

export const chamarProximaSenha = async (etapa) => {
  const resposta = await requisitarApi("/filas/chamadas", {
    method: "POST",
    body: JSON.stringify({ etapa }),
  });
  return normalizarSenha(resposta?.senha ?? resposta);
};

export const rechamarSenha = async (senhaId) => {
  const resposta = await requisitarApi(
    `/senhas/${encodeURIComponent(senhaId)}/rechamadas`,
    { method: "POST" },
  );
  return {
    ...resposta,
    senha: normalizarSenha(resposta?.senha),
  };
};

export const cancelarSenha = async (senhaId, motivo) => {
  const resposta = await requisitarApi(
    `/senhas/${encodeURIComponent(senhaId)}/cancelamentos`,
    {
      method: "POST",
      body: JSON.stringify(motivo ? { motivo } : {}),
    },
  );
  return normalizarSenha(resposta?.senha ?? resposta);
};
