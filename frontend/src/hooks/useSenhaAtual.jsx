// Hook da senha atual: concentra as ações que alteram o atendimento ativo do posto.
import { useCallback } from "react";
import { useAtendimento } from "./useAtendimento";
import {
  atualizarPrioridadeSenha,
  chamarSenhaSelecionada,
} from "../services/filaService";

export const useSenhaAtual = (etapa) => {
  const { senhaAtual, setSenhaAtual, setCarregando, setErro } = useAtendimento();

  // Reserva a senha escolhida e a torna a senha atual; o detalhe será carregado no fluxo de atendimento.
  const chamarSenha = useCallback(async (senhaId) => {
    try {
      setCarregando(true);
      const senha = await chamarSenhaSelecionada(senhaId, etapa);
      setSenhaAtual(senha);
      setErro(null);
      return senha;
    } catch (erro) {
      setErro(erro.message);
      throw erro;
    } finally {
      setCarregando(false);
    }
  }, [etapa, setCarregando, setErro, setSenhaAtual]);

  // Alterna a prioridade persistida da senha que está em atendimento no posto.
  const alterarPrioridade = useCallback(async () => {
    if (!senhaAtual) return null;

    try {
      setCarregando(true);
      const senha = await atualizarPrioridadeSenha(
        senhaAtual.id,
        !senhaAtual.prioritaria,
      );
      setSenhaAtual(senha);
      setErro(null);
      return senha;
    } catch (erro) {
      setErro(erro.message);
      throw erro;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual, setCarregando, setErro, setSenhaAtual]);

  return {
    senhaAtual,
    chamarSenha,
    alterarPrioridade,
  };
};
