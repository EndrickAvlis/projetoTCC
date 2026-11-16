export const OPCOES_PERIODO = [
  { valor: "TODO", label: "Todo o período" },
  { valor: "HOJE", label: "Hoje" },
  { valor: "SEMANA", label: "Esta semana" },
  { valor: "MES", label: "Este mês" },
  { valor: "PERSONALIZADO", label: "Personalizado" },
];

const formatarDataCurta = (dataIso) => {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : dataIso;
};

export const obterRotuloPeriodo = ({ periodo, dataInicio, dataFim }) => {
  if (periodo === "PERSONALIZADO" && dataInicio && dataFim) {
    return `${formatarDataCurta(dataInicio)} a ${formatarDataCurta(dataFim)}`;
  }

  return OPCOES_PERIODO.find((opcao) => opcao.valor === periodo)?.label;
};
