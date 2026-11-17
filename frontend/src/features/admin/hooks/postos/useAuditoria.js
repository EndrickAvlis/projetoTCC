import * as React from "react";
import { dadosAuditoria } from "../../services/postosService";
import { useDebounce } from "../../../../hooks/useDebounce";

export const useAuditoria = ({
  busca = "",
  status = null,
  tipoPeriodo = "HOJE",
  dataInicio,
  dataFim,
  pagina = 1,
  limite = 7,
} = {}) => {
  const buscaDebounced = useDebounce(busca, 300);
  const [senhas, setSenhas] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregar = React.useCallback(async (silencioso = false) => {
    if (tipoPeriodo === "PERSONALIZADO" && (!dataInicio || !dataFim)) {
      if (!silencioso) {
        setErro(null);
        setCarregando(false);
      }
      return;
    }

    if (!silencioso) {
      setCarregando(true);
      setErro(null);
    }

    try {
      const res = await dadosAuditoria({
        busca: buscaDebounced,
        status,
        tipoPeriodo,
        dataInicio,
        dataFim,
        pagina,
        limite,
      });

      setSenhas(res.itens);
      setTotal(res.paginacao.totalItens);
    } catch (err) {
      setErro(err.message);
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, [buscaDebounced, status, tipoPeriodo, dataInicio, dataFim, pagina, limite]);

  React.useEffect(() => {
    void Promise.resolve().then(() => carregar());

    const intervalo = window.setInterval(() => {
      carregar(true);
    }, 120000);

    return () => window.clearInterval(intervalo);
  }, [carregar]);

  return {
    senhas,
    total,
    carregando,
    erro,
    recarregar: carregar,
  };
};

export default useAuditoria;
