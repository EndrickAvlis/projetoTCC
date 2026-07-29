// Serviço de atendimento: carrega detalhes e controla início/fim do histórico.
import { requisitarApi } from "./apiClient";
import { normalizarSenha } from "./filaService";

export const obterDetalheSenha = async (senhaId) => {
  const resposta = await requisitarApi(
    `/senhas/${encodeURIComponent(senhaId)}/detalhe`,
  );

  return {
    ...resposta,
    senha: normalizarSenha(resposta?.senha),
  };
};

export const iniciarAtendimento = (senhaId) =>
  requisitarApi("/atendimentos", {
    method: "POST",
    body: JSON.stringify({ senhaId }),
  });

export const finalizarAtendimento = (atendimentoId) =>
  requisitarApi(
    `/atendimentos/${encodeURIComponent(atendimentoId)}/finalizacoes`,
    { method: "POST" },
  );
