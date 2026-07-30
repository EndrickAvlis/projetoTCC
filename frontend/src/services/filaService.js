// Serviço da fila: adapta senhas e chama os contratos de fila, histórico e prioridade.
import { requisitarApi } from "./apiClient";

// Normaliza os nomes do contrato para a interface sem alterar os dados originais da API.
export const normalizarSenha = (senha) => {
  if (!senha) return null;

  return {
    ...senha,
    numero: senha.codigo,
    etapa: senha.etapaAtual,
    prioritaria: senha.tipoSenha,
  };
};

// Busca as senhas aguardando da etapa que está aberta no posto.
export const listarFila = async (etapa) => {
  const resposta = await requisitarApi(
    `/filas?etapa=${encodeURIComponent(etapa)}`,
  );
  return (resposta?.senhas ?? resposta ?? []).map(normalizarSenha);
};

// Busca as senhas chamadas no dia atual exclusivamente para a etapa solicitada.
export const listarChamadasHoje = async (etapa) => {
  const resposta = await requisitarApi(
    `/filas/historico?etapa=${encodeURIComponent(etapa)}`,
  );
  return (resposta?.senhas ?? resposta ?? []).map(normalizarSenha);
};

// Reserva a senha escolhida pelo atendente; o backend valida a etapa e a concorrência.
export const chamarSenhaSelecionada = async (senhaId, etapa) => {
  const resposta = await requisitarApi("/filas/chamadas", {
    method: "POST",
    body: JSON.stringify({ senhaId, etapa }),
  });
  return normalizarSenha(resposta?.senha ?? resposta);
};

// Atualiza a prioridade persistente da senha atualmente atendida.
export const atualizarPrioridadeSenha = async (senhaId, tipoSenha) => {
  const resposta = await requisitarApi(
    `/senhas/${encodeURIComponent(senhaId)}/prioridade`,
    {
      method: "PATCH",
      body: JSON.stringify({ tipoSenha }),
    },
  );
  return normalizarSenha(resposta?.senha ?? resposta);
};

// Emite uma nova senha no banco
export const emitirSenha = async () => {
  const resposta = await requisitarApi("/senhas", {
    method: "POST",
    autenticada: false,
  });

  return normalizarSenha(resposta.senha);
};