import * as React from "react";
import { dadosRelatorio } from "../services/relatorioService";

const RESUMO_INICIAL = {
  totais: { totalArrecadado: 0, totalVendas: 0, ticketMedio: 0 },
  porCategoria: {
    uniformes: { valor: 0, quantidade: 0 },
    armarios: { valor: 0, quantidade: 0 },
    contribuicao: { valor: 0, quantidade: 0 },
  },
  porPagamento: { dinheiro: 0, pix: 0, debito: 0, credito: 0 },
};

export const useRelatorios = ({
  periodo = "TODO",
  dataInicio = "",
  dataFim = "",
  cursoId = "",
  formaPagamento = "",
  atendenteId = "",
  pagina = 1,
  limite = 10,
} = {}) => {
  const [resumoReceita, setResumoReceita] = React.useState(RESUMO_INICIAL);
  const [vendas, setVendas] = React.useState([]);
  const [totalVendas, setTotalVendas] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarRelatorios = React.useCallback(async () => {
    if (periodo === "PERSONALIZADO" && (!dataInicio || !dataFim)) {
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const res = await dadosRelatorio({
        periodo,
        dataInicio,
        dataFim,
        cursoId,
        formaPagamento,
        atendenteId,
        pagina,
        limite,
      });

      setResumoReceita(res?.resumoReceita ?? RESUMO_INICIAL);
      setVendas(res?.vendas ?? []);
      setTotalVendas(res?.totalVendas ?? 0);
    } catch (err) {
      setResumoReceita(RESUMO_INICIAL);
      setVendas([]);
      setTotalVendas(0);
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [
    periodo,
    dataInicio,
    dataFim,
    cursoId,
    formaPagamento,
    atendenteId,
    pagina,
    limite,
  ]);

  React.useEffect(() => {
    carregarRelatorios();
  }, [carregarRelatorios]);

  return {
    resumoReceita,
    vendas,
    totalVendas,
    carregando,
    erro,
    recarregar: carregarRelatorios,
  };
};

export default useRelatorios;
