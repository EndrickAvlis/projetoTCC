import * as React from "react";
import * as atendimentoService from "../services/atendimentoService";
import * as filaService from "../services/filaService";

const AtendimentoContext = React.createContext(null);

export const AtendimentoProvider = ({ children }) => {
  const [senhaAtual, setSenhaAtual] = React.useState(null);
  const [atendimentoAtual, setAtendimentoAtual] = React.useState(null);
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState(null);

  // Fase calculada diretamente sem necessidade de useMemo complexo
  const fase = !senhaAtual
    ? "sem_senha"
    : atendimentoAtual?.iniciadoEm
      ? "iniciada"
      : "chamada";

  const limparAtendimento = React.useCallback(() => {
    setSenhaAtual(null);
    setAtendimentoAtual(null);
    setErro(null);
    setCarregando(false);
  }, []);

  const definirAtendimento = React.useCallback((senha, atendimento = null) => {
    setSenhaAtual(senha);
    setAtendimentoAtual(atendimento);
  }, []);

  const chamarSenha = React.useCallback(
    async (senhaId, etapa) => {
      try {
        setCarregando(true);
        setErro(null);

        const senha = await filaService.chamarSenha(senhaId, etapa);
        definirAtendimento(senha, null);
        return senha;
      } catch (err) {
        setErro(err.message);
        return null;
      } finally {
        setCarregando(false);
      }
    },
    [definirAtendimento],
  );

  const alterarPrioridade = React.useCallback(async () => {
    if (!senhaAtual) return null;
    try {
      setCarregando(true);
      setErro(null);

      const senhaAtualizada = await filaService.alterarPrioridade(
        senhaAtual.id,
        !senhaAtual.prioritaria,
      );
      setSenhaAtual(senhaAtualizada);
      return senhaAtualizada;
    } catch (err) {
      setErro(err.message);
      return null;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  const iniciar = React.useCallback(async () => {
    if (!senhaAtual) return null;

    try {
      setCarregando(true);
      setErro(null);
      const res = await atendimentoService.iniciarAtendimento(senhaAtual.id);
      setAtendimentoAtual(res.atendimento);
      return res.atendimento;
    } catch (error) {
      setErro(error.message);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  const rechamar = React.useCallback(async () => {
    if (!senhaAtual) return null;

    try {
      setCarregando(true);
      setErro(null);
      return await atendimentoService.rechamarSenha(
        senhaAtual.id,
        senhaAtual.etapa,
      );
    } catch (error) {
      setErro(error.message);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  const finalizar = React.useCallback(async () => {
    if (!senhaAtual) return null;

    try {
      setCarregando(true);
      setErro(null);
      const res = await atendimentoService.finalizarAtendimento(senhaAtual.id);
      limparAtendimento();
      return res;
    } catch (error) {
      setErro(error.message);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual, limparAtendimento]);

  const pular = React.useCallback(async () => {
    if (!senhaAtual) return null;

    try {
      setCarregando(true);
      setErro(null);
      const res = await atendimentoService.cancelarAtendimento(senhaAtual.id);
      limparAtendimento();
      return res;
    } catch (error) {
      setErro(error.message);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual, limparAtendimento]);

  const recuperarAtendimentoAtivo = React.useCallback(
    async (etapa) => {
      if (!etapa) return null;

      try {
        setCarregando(true);
        setErro(null);
        const res = await atendimentoService.recuperarAtendimento(etapa);
        if (res?.senha) {
          definirAtendimento(res.senha, res.atendimento);
        } else {
          limparAtendimento();
        }
        return res;
      } catch (error) {
        limparAtendimento();
        setErro(error.message);
        return null;
      } finally {
        setCarregando(false);
      }
    },
    [definirAtendimento, limparAtendimento],
  );

  React.useEffect(() => {
    const handleLogout = () => limparAtendimento();
    window.addEventListener("auth:unauthorized", handleLogout);
    return () => window.removeEventListener("auth:unauthorized", handleLogout);
  }, [limparAtendimento]);

  const value = {
    senhaAtual,
    setSenhaAtual,
    atendimentoAtual,
    setAtendimentoAtual,
    fase,
    carregando,
    setCarregando,
    erro,
    setErro,
    chamarSenha,
    alterarPrioridade,
    definirAtendimento,
    limparAtendimento,
    iniciar,
    rechamar,
    finalizar,
    pular,
    recuperarAtendimentoAtivo,
  };

  return (
    <AtendimentoContext.Provider value={value}>
      {children}
    </AtendimentoContext.Provider>
  );
};

export const useAtendimento = () => {
  const context = React.useContext(AtendimentoContext);

  if (!context) {
    throw new Error(
      "useAtendimento deve ser usado dentro do AtendimentoProvider.",
    );
  }

  return context;
};
