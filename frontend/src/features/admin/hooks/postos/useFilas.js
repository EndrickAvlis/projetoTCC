import * as React from "react";
import { dadosFila } from "../../services/postosService";

export const useFilas = () => {
  const [postos, setPostos] = React.useState([]);
  const [pendencias, setPendencias] = React.useState([]);
  const [resumo, setResumo] = React.useState({
    totalAguardando: 0,
    totalEmAtendimento: 0,
    totalPendentes: 0,
  });
  const [carregando, setCarregando] = React.useState(true);
  const [atualizadoEm, setAtualizadoEm] = React.useState(null);

  const carregar = React.useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);

    try {
      const res = await dadosFila();
      setPostos(res.postos);
      setPendencias(res.pendencias);
      setResumo(res.resumo);
      setAtualizadoEm(res.atualizadoEm);
    } catch {
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    carregar();

    const intervalo = window.setInterval(() => {
      carregar(true);
    }, 30000);

    return () => window.clearInterval(intervalo);
  }, [carregar]);

  return {
    postos,
    pendencias,
    resumo,
    carregando,
    atualizadoEm,
    recarregar: carregar,
  };
};

export default useFilas;
