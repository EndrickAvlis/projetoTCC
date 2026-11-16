import RelatorioService from "../services/relatorioService.js";

const relatorioService = new RelatorioService();

export const obterDadosRelatorio = async (req, res) => {
  const dados = await relatorioService.obterDadosRelatorio(req.validado.query);

  return res.json(dados);
};

export const obterDetalhesVenda = async (req, res) => {
  const { id } = req.validado.params;
  const venda = await relatorioService.obterDetalhesVenda(id);

  return res.json({ venda });
};

export const exportarVendas = async (req, res) => {
  const { csv, nomeArquivo } = await relatorioService.exportarVendasCsv(
    req.validado.query,
  );

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo}"`);

  return res.send(csv);
};
