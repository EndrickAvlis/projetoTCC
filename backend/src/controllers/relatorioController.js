
import RelatorioService from "../services/relatorioService.js";

const relatorioService = new RelatorioService();

const formatarDataCsv = (data) =>
  new Date(data).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

export const obterDadosRelatorio = async (req, res) => {
  const filtros = req.validado?.query || req.query;
  const dados = await relatorioService.obterDadosRelatorio(filtros);

  return res.json(dados);
};

export const obterDetalhesVenda = async (req, res) => {
  const id = Number(req.validado?.params?.id || req.params.id);
  const venda = await relatorioService.obterDetalhesVenda(id);

  return res.json({ venda });
};

export const exportarVendas = async (req, res) => {
  const filtros = req.validado?.query || req.query;
  const vendas = await relatorioService.buscarVendasParaExportar(filtros);

  const cabecalho =
    "Código;Data e Hora;Aluno;Curso;Período;Atendente;Pagamento;Qtd Itens;Contribuição;Total";

  const formatarCampo = (valor) => {
    const texto = String(valor ?? "")
      .replace(/^[\s]*([=+@-])/, "'$1")
      .replace(/"/g, '""');

    return `"${texto}"`;
  };

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
    ].map(formatarCampo).join(";"),
  );

  const dataAtual = new Date().toISOString().split("T")[0];

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="extrato-vendas-${dataAtual}.csv"`,
  );

  return res.send(`\uFEFF${cabecalho}\n${linhas.join("\n")}`);
};
