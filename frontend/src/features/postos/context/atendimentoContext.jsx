import * as React from "react";
import * as atendimentoService from "../services/atendimentoService";
import * as filaService from "../services/filaService";

const AtendimentoContext = React.createContext(null);

export const AtendimentoProvider = ({ children }) => {
  const [senhaAtual, setSenhaAtual] = React.useState(null);
  const [dadosAluno, setDadosAluno] = React.useState(null);
  const [atendimentoAtual, setAtendimentoAtual] = React.useState(null);
  const [carregando, setCarregando] = React.useState(false);

  const fase = !senhaAtual
    ? "sem_senha"
    : senhaAtual.status === "em_atendimento"
      ? "iniciada"
      : "chamada";

  const limparAtendimento = React.useCallback(() => {
    setSenhaAtual(null);
    setAtendimentoAtual(null);
    setDadosAluno(null);
    setCarregando(false);
  }, []);

  const definirAtendimento = React.useCallback((senha, atendimento = null) => {
    setSenhaAtual(senha);
    setAtendimentoAtual(atendimento);
    setDadosAluno(senha?.aluno ?? null);
  }, []);

  const chamarSenha = React.useCallback(
    async (senhaId, etapa) => {
      try {
        setCarregando(true);
        const senha = await filaService.chamarSenha(senhaId, etapa);
        definirAtendimento(senha, null);
        return senha;
      } finally {
        setCarregando(false);
      }
    },
    [definirAtendimento],
  );

  const alterarPrioridadeSenha = React.useCallback(async () => {
    if (!senhaAtual) return null;
    try {
      setCarregando(true);
      const senhaAtualizada = await filaService.alterarPrioridade(
        senhaAtual.id,
        !senhaAtual.prioritaria,
      );
      setSenhaAtual((prevs) =>
        prevs ? { ...prevs, ...senhaAtualizada } : senhaAtualizada,
      );
      return senhaAtualizada;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  const iniciarAtendimento = React.useCallback(async () => {
    if (!senhaAtual) return null;

    try {
      setCarregando(true);
      const res = await atendimentoService.iniciarAtendimento(senhaAtual.id);
      setAtendimentoAtual(res.atendimento);
      setSenhaAtual((prev) =>
        prev ? { ...prev, status: "em_atendimento" } : prev,
      );
      if (res.aluno) {
        setDadosAluno(res.aluno);
      }
      return res.atendimento;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  const rechamarSenha = React.useCallback(async () => {
    if (!senhaAtual) return null;

    try {
      setCarregando(true);
      return await filaService.rechamarSenha(senhaAtual.id, senhaAtual.etapa);
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual]);

  const finalizarAtendimento = React.useCallback(async () => {
    if (!senhaAtual) return null;

    try {
      setCarregando(true);
      const res = await atendimentoService.finalizarAtendimento(senhaAtual.id);
      limparAtendimento();
      return res;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual, limparAtendimento]);

  const cancelarAtendimento = React.useCallback(async () => {
    if (!senhaAtual) return null;

    try {
      setCarregando(true);
      const res = await atendimentoService.cancelarAtendimento(senhaAtual.id);
      limparAtendimento();
      return res;
    } finally {
      setCarregando(false);
    }
  }, [senhaAtual, limparAtendimento]);

  const recuperarAtendimentoAtivo = React.useCallback(
    async (etapa) => {
      if (!etapa) return null;

      try {
        setCarregando(true);
        const res = await atendimentoService.recuperarAtendimento(etapa);
        if (res?.senha) {
          definirAtendimento(res.senha, res.atendimento);
        } else {
          limparAtendimento();
        }
        return res;
      } catch (error) {
        limparAtendimento();
        throw error;
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
    dadosAluno,
    setDadosAluno,
    fase,
    carregando,
    setCarregando,
    chamarSenha,
    alterarPrioridadeSenha,
    definirAtendimento,
    limparAtendimento,
    iniciarAtendimento,
    rechamarSenha,
    finalizarAtendimento,
    cancelarAtendimento,
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
