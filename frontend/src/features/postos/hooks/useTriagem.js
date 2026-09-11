import * as React from "react";
import * as TriagemService from "../services/TriagemService";

export const useTriagem = () => {
  const [fase, setFase] = React.useState("sem_senha");
  const [senhaAtual, setSenhaAtual] = React.useState(null);
  const [atendimentoAtual, setAtendimentoAtual] = React.useState(null);
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState(null);

  const limparEstado = React.useCallback(() => {
    setFase("sem_senha");
    setSenhaAtual(null);
    setAtendimentoAtual(null);
    setErro(null);
    setCarregando(false);
  }, []);

  const carregarEstadoAtual = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.recuperarAtendimentoAtual();
      if (res?.senha) {
        setSenhaAtual(res.senha);
        setAtendimentoAtual(res.historico ?? null);
        if (res.historico?.iniciadaEm || res.historico?.iniciadoEm) {
          setFase("iniciada");
        } else {
          setFase("chamada");
        }
      } else {
        limparEstado();
      }
    } catch (error) {
      limparEstado();
      setErro(error.message || "Erro ao recuperar atendimento atual");
    } finally {
      setCarregando(false);
    }
  }, [limparEstado]);

  React.useEffect(() => {
    void Promise.resolve().then(carregarEstadoAtual);
  }, [carregarEstadoAtual]);

  const definirSenhaChamada = React.useCallback((senha) => {
    setSenhaAtual(senha);
    setAtendimentoAtual(null);
    setFase("chamada");
    setErro(null);
  }, []);

  const iniciar = React.useCallback(async (senhaId) => {
    const id = senhaId ?? senhaAtual?.id;
    if (!id) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.iniciarAtendimento(id);
      const atendimento = res?.atendimento ?? res;
      setAtendimentoAtual(atendimento);
      setFase("iniciada");
      return atendimento;
    } catch (error) {
      setErro(error.message || "Erro ao iniciar atendimento");
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  const salvarDados = React.useCallback(async (payload, senhaId) => {
    const id = senhaId ?? senhaAtual?.id;
    if (!id) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.salvarDados(id, payload);
      return res;
    } catch (error) {
      setErro(error.message || "Erro ao salvar dados do aluno");
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  const finalizar = React.useCallback(async (atendimentoId) => {
    const id = atendimentoId ?? atendimentoAtual?.id;
    if (!id) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.finalizarAtendimento(id);
      limparEstado();
      return res;
    } catch (error) {
      setErro(error.message || "Erro ao finalizar atendimento");
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [atendimentoAtual, limparEstado]);

  const salvarPendencia = React.useCallback(async (documentos, atendimentoId) => {
    const id = atendimentoId ?? atendimentoAtual?.id;
    if (!id) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.salvarPendencia(id, documentos);
      limparEstado();
      return res;
    } catch (error) {
      setErro(error.message || "Erro ao salvar pendência");
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [atendimentoAtual, limparEstado]);

  const rechamar = React.useCallback(async (senhaId) => {
    const id = senhaId ?? senhaAtual?.id;
    if (!id) return null;

    setCarregando(true);
    setErro(null);

    try {
      const res = await TriagemService.rechamarSenha(id);
      return res;
    } catch (error) {
      setErro(error.message || "Erro ao rechamar senha");
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
