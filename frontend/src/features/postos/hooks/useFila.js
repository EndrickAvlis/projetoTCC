import * as React from "react";
import { listarFila, listarChamadasHoje } from "../services/filaService";

export const useFila = (etapa) => {
  const [senhasAguardando, setSenhasAguardando] = React.useState([]);
  const [senhasChamadasHoje, setSenhasChamadasHoje] = React.useState([]);
  const [carregandoFila, setCarregandoFila] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarFila = React.useCallback(
    async ({ silencioso = false } = {}) => {
      if (!etapa) return;

      try {
        if (!silencioso) setCarregandoFila(true);

        const [aguardando, chamadas] = await Promise.all([
          listarFila(etapa),
          listarChamadasHoje(etapa),
        ]);

        setSenhasAguardando(aguardando);
        setSenhasChamadasHoje(chamadas);
        setErro(null);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        if (!silencioso) setCarregandoFila(false);
      }
    },
    [etapa],
  );

  React.useEffect(() => {
    carregarFila();

    const intervalo = window.setInterval(() => {
      carregarFila({ silencioso: true });
    }, 5000);

    return () => window.clearInterval(intervalo);
  }, [carregarFila]);

  const limparerro = () => setErro(null);

  return {
    senhasAguardando,
    senhasChamadasHoje,
    carregandoFila,
    erro,
    limparerro,
    carregarFila,
  };
};

export default useFila;