import * as React from "react";
import * as TriagemService from "../services/TriagemService";
import { useAtendimento } from "../../../hooks/useAtendimento";

export const useTriagem = () => {
  const {
    senhaAtual,
    setSenhaAtual,
    atendimentoAtual,
    setAtendimentoAtual,
  } = useAtendimento();

  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState(null);

  const fase = React.useMemo(() => {
    if (!senhaAtual) return "sem_senha";
    if (atendimentoAtual?.iniciadoEm) {
      return "iniciada";
    }
    return "chamada";
  }, [senhaAtual, atendimentoAtual]);

  const limparEstado = React.useCallback(() => {
    setSenhaAtual(null);
    setAtendimentoAtual(null);
    setErro(null);
    setCarregando(false);
  }, [setSenhaAtual, setAtendimentoAtual]);

  const carregarEstadoAtual = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.recuperarAtendimentoAtual();
      if (res.senha) {
        setSenhaAtual(res.senha);
        setAtendimentoAtual(res.historico);
      } else {
        limparEstado();
      }
    } catch (error) {
      limparEstado();
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [limparEstado, setSenhaAtual, setAtendimentoAtual]);

  React.useEffect(() => {
    void Promise.resolve().then(carregarEstadoAtual);
  }, [carregarEstadoAtual]);

  const definirSenhaChamada = React.useCallback((senha) => {
    setSenhaAtual(senha);
    setAtendimentoAtual(null);
    setErro(null);
  }, [setSenhaAtual, setAtendimentoAtual]);

  const iniciar = React.useCallback(async () => {
    if (!senhaAtual) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.iniciarAtendimento(senhaAtual.id);
      setAtendimentoAtual(res.atendimento);
      return res.atendimento;
    } catch (error) {
      setErro(error.message);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual, setAtendimentoAtual]);

  const salvarDados = React.useCallback(async (payload) => {
    if (!senhaAtual) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.salvarDados(senhaAtual.id, payload);
      return res;
    } catch (error) {
      setErro(error.message);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  const finalizar = React.useCallback(async () => {
    if (!atendimentoAtual) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.finalizarAtendimento(atendimentoAtual.id);
      limparEstado();
      return res;
    } catch (error) {
      setErro(error.message);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [atendimentoAtual, limparEstado]);

  const salvarPendencia = React.useCallback(async (documentos) => {
    if (!atendimentoAtual) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.salvarPendencia(atendimentoAtual.id, documentos);
      limparEstado();
      return res;
    } catch (error) {
      setErro(error.message);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [atendimentoAtual, limparEstado]);

  const rechamar = React.useCallback(async () => {
    if (!senhaAtual) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.rechamarSenha(senhaAtual.id);
      return res;
    } catch (error) {
      setErro(error.message);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  return {
    fase,
    senhaAtual,
    atendimentoAtual,
    carregando,
    erro,
    definirSenhaChamada,
    iniciar,
    salvarDados,
    finalizar,
    salvarPendencia,
    rechamar,
    limparEstado,
    recarregar: carregarEstadoAtual,
  };
};

export default useTriagem;
