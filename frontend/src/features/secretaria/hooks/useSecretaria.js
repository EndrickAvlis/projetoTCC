import * as React from "react";
import { obterKpis, listarPendencias } from "../services/secretariaService";
import { useDebounce } from "../../../hooks/useDebounce";

const KPIS_INICIAIS = {
  comprasPendentes: 0,
  itensPendentes: 0,
};

export const useSecretaria = ({ limite = 8 } = {}) => {
  const [kpis, setKpis] = React.useState(KPIS_INICIAIS);
  const [carregandoKpis, setCarregandoKpis] = React.useState(true);

  const [busca, setBusca] = React.useState("");
  const [cursoId, setCursoId] = React.useState("");
  const [pagina, setPagina] = React.useState(1);

  const [compras, setCompras] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const buscaDebounced = useDebounce(busca, 300);

  const carregarKpis = React.useCallback(async () => {
    try {
      setCarregandoKpis(true);
      const res = await obterKpis();
      setKpis({
        comprasPendentes: res?.comprasPendentes ?? 0,
        itensPendentes: res?.itensPendentes ?? 0,
      });
    } catch {
      setKpis(KPIS_INICIAIS);
    } finally {
      setCarregandoKpis(false);
    }
  }, []);

  const carregarPendencias = React.useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const res = await listarPendencias({
        busca: buscaDebounced.trim() || undefined,
        cursoId: cursoId || undefined,
        pagina,
        limite,
      });

      setCompras(res?.compras ?? []);
      setTotal(res?.total ?? 0);
    } catch (err) {
      setCompras([]);
      setTotal(0);
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [buscaDebounced, cursoId, pagina, limite]);

  React.useEffect(() => {
    carregarKpis();
  }, [carregarKpis]);

  React.useEffect(() => {
    carregarPendencias();
  }, [carregarPendencias]);

  const alterarFiltro = (campo, valor) => {
    if (campo === "busca") setBusca(valor);
    if (campo === "cursoId") setCursoId(valor);
    setPagina(1);
  };

  const limparFiltros = () => {
    setBusca("");
    setCursoId("");
    setPagina(1);
  };

  const recarregar = () => {
    carregarKpis();
    carregarPendencias();
  };

  return {
    kpis,
    carregandoKpis,
    busca,
    cursoId,
    pagina,
    limite,
    compras,
    total,
    carregando,
    erro,
    alterarFiltro,
    limparFiltros,
    mudarPagina: setPagina,
    recarregar,
    recarregarKpis: carregarKpis,
  };
};

export default useSecretaria;
