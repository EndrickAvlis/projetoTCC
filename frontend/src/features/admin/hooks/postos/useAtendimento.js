import * as React from "react";
import { dadosAtendimento } from "../../services/postosService";

const CARDS_PADRAO = {
  senhasFinalizadas: 0,
  senhasCanceladas: 0,
  senhasEmitidas: 0,
  tma: 0,
};

export const useAtendimento = ({
  tipoPeriodo = "hoje",
  dataInicio,
  dataFim,
  cursoId,
  periodoCurso,
} = {}) => {
  const [cards, setCards] = React.useState(CARDS_PADRAO);
  const [finalizadasPorHora, setFinalizadasPorHora] = React.useState([]);
  const [cursosAtivos, setCursosAtivos] = React.useState([]);
  const [carregando, setCarregando] = React.useState(true);

  const carregar = React.useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);

    try {
      const res = await dadosAtendimento({
        tipoPeriodo,
        dataInicio,
        dataFim,
        cursoId,
        periodoCurso,
      });

      setCards(res.cards);
      setFinalizadasPorHora(res.finalizadasPorHora);
      setCursosAtivos(res.cursosAtivos);
    } catch {}
    finally {
      if (!silencioso) setCarregando(false);
    }
  }, [tipoPeriodo, dataInicio, dataFim, cursoId, periodoCurso]);

  React.useEffect(() => {
    carregar();

    const intervalo = window.setInterval(() => {
      carregar(true);
    }, 60000);

    return () => window.clearInterval(intervalo);
  }, [carregar]);

  return {
    cards,
    finalizadasPorHora,
    cursosAtivos,
    carregando,
    recarregar: carregar,
  };
};

export default useAtendimento;
