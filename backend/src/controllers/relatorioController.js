import RelatorioService from "../services/relatorioService.js";

const relatorioService = new RelatorioService();

const formatarDataCsv = (data) =>
  new Date(data).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });



export const exportarVendas = async (req, res) => {
  const filtros = req.validado?.query || req.query;
  const vendas = await relatorioService.buscarVendasParaExportar(filtros);

  const cabecalho =
    "Código;Data e Hora;Aluno;Curso;Período;Atendente;Pagamento;Qtd Itens;Contribuição;Total";

  const linhas = vendas.map((venda) =>
    [
      venda.codigoRetirada,
      formatarDataCsv(venda.dataHora),
      venda.aluno,
      venda.curso,
      venda.periodo,
      venda.atendente,
      venda.formaPagamento,
      venda.quantidadeItens,
      venda.contribuicao.toFixed(2).replace(".", ","),
      venda.precoTotal.toFixed(2).replace(".", ","),
    ].join(";"),
  );

  const dataAtual = new Date().toISOString().split("T")[0];
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="extrato-vendas-${dataAtual}.csv"`,
  );

  return res.send(`\uFEFF${cabecalho}\n${linhas.join("\n")}`);
};

// GET /relatorios/dados - Retorna resumoReceita (totais, origens e formas) e lista paginada de vendas
// export const obterDadosRelatorio = async (req, res) => {};

// GET /relatorios/detalhe/:id - Retorna o recibo digital da venda específica com itens e valores
// export const obterDetalhesVenda = async (req, res) => {};
