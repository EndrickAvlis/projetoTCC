import * as React from "react";
import * as TriagemService from "../services/TriagemService";
import { useAtendimento } from "../../../hooks/useAtendimento";

export const usePendencias = () => {
  const { setSenhaAtual, setAtendimentoAtual } = useAtendimento();
  const [pendencias, setPendencias] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [pendenciaSelecionada, setPendenciaSelecionada] = React.useState(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarPendencias = React.useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) setCarregando(true);
      setErro(null);

      try {
        const res = await TriagemService.listarPendencias();
        setPendencias(res.pendencias);
        setTotal(res.total);
      } catch (error) {
        setPendencias([]);
        setTotal(0);
        setErro(error.message);
      } finally {
        if (!silencioso) setCarregando(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void Promise.resolve().then(carregarPendencias);
    const intervalo = window.setInterval(
      () => void carregarPendencias({ silencioso: true }),
      5000,
    );

    return () => window.clearInterval(intervalo);
  }, [carregarPendencias]);

  const selecionarPendencia = React.useCallback((pendencia) => {
    setPendenciaSelecionada(pendencia);
  }, []);

  const limparSelecao = React.useCallback(() => {
    setPendenciaSelecionada(null);
  }, []);

  const retomar = React.useCallback(
    async (senhaId) => {
      if (!senhaId) return null;

      setCarregando(true);
      setErro(null);

      try {
        const res = await TriagemService.retomarPendencia(senhaId);
        if (res.senha) {
          setSenhaAtual(res.senha);
          setAtendimentoAtual(res.historico);
        }
        setPendenciaSelecionada(null);
        await carregarPendencias({ silencioso: true });
        return res;
      } catch (error) {
        setErro(error.message);
        throw error;
      } finally {
        setCarregando(false);
      }
    },
    [carregarPendencias, setSenhaAtual, setAtendimentoAtual],
  );

  return {
    pendencias,
    total,
    pendenciaSelecionada,
    carregando,
    erro,
    selecionarPendencia,
    limparSelecao,
    retomar,
    recarregar: carregarPendencias,
  };
};
