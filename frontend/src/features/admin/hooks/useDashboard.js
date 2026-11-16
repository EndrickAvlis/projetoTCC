import * as React from "react";
import { obterDashboard } from "../services/dashboardService";

const TOTAIS_INICIAIS = { arrecadado: 0, vendas: 0 };

const CATEGORIAS_INICIAIS = {
  uniformes: { valor: 0, quantidade: 0 },
  armarios: { valor: 0, quantidade: 0 },
  contribuicao: { valor: 0, quantidade: 0 },
};

export const useDashboard = ({
  periodo = "TODO",
  dataInicio = "",
  dataFim = "",
} = {}) => {
  const [totais, setTotais] = React.useState(TOTAIS_INICIAIS);
  const [categorias, setCategorias] = React.useState(CATEGORIAS_INICIAIS);
  const [produtos, setProdutos] = React.useState([]);
  const [cursos, setCursos] = React.useState([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarDashboard = React.useCallback(
    async (estaAtivo = () => true) => {
      if (periodo === "PERSONALIZADO" && (!dataInicio || !dataFim)) {
        setErro(null);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const res = await obterDashboard({
          periodo,
          dataInicio: periodo === "PERSONALIZADO" ? dataInicio : undefined,
          dataFim: periodo === "PERSONALIZADO" ? dataFim : undefined,
        });

        if (!estaAtivo()) return;

        setTotais(res.totais);
        setCategorias(res.categorias);
        setProdutos(res.produtos);
        setCursos(res.cursos);
      } catch (err) {
        if (!estaAtivo()) return;
        setTotais(TOTAIS_INICIAIS);
        setCategorias(CATEGORIAS_INICIAIS);
        setProdutos([]);
        setCursos([]);
        setErro(err.message);
      } finally {
        if (estaAtivo()) {
          setCarregando(false);
        }
      }
    },
    [periodo, dataInicio, dataFim],
  );

  React.useEffect(() => {
    let ativo = true;
    void Promise.resolve().then(() => carregarDashboard(() => ativo));

    return () => {
      ativo = false;
    };
  }, [carregarDashboard]);

  const recarregar = React.useCallback(
    () => carregarDashboard(),
    [carregarDashboard],
  );

  return {
    totais,
    categorias,
    produtos,
    cursos,
    carregando,
    erro,
    recarregar,
  };
};

export default useDashboard;
