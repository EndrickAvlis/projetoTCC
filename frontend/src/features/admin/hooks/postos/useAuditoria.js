import * as React from "react";
import { dadosAuditoria } from "../../services/postosService";
import { useDebounce } from "../../../../hooks/useDebounce";

export const useAuditoria = ({
  busca = "",
  status = "",
  tipoPeriodo = "hoje",
  periodo,
  dataInicio,
  dataFim,
  pagina = 1,
  limite = 7,
} = {}) => {
  const periodoEfetivo = periodo || tipoPeriodo;
  const buscaDebounced = useDebounce(busca, 300);
  const [senhas, setSenhas] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);

  const carregar = React.useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);

    try {
      const res = await dadosAuditoria({
        busca: buscaDebounced,
        status,
        tipoPeriodo: periodoEfetivo,
        dataInicio,
        dataFim,
        pagina,
        limite,
      });

      setSenhas(res.itens);
      setTotal(res.paginacao.totalItens);
    } catch {}
    finally {
      if (!silencioso) setCarregando(false);
    }
  }, [buscaDebounced, status, periodoEfetivo, dataInicio, dataFim, pagina, limite]);

  React.useEffect(() => {
    carregar();

    const intervalo = window.setInterval(() => {
      carregar(true);
    }, 120000);

    return () => window.clearInterval(intervalo);
  }, [carregar]);

  return {
    senhas,
    total,
    carregando,
    recarregar: carregar,
  };
};

export default useAuditoria;
