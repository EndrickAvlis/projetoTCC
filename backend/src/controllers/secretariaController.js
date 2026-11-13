import SecretariaService from "../services/secretariaService.js";

const secretariaService = new SecretariaService();

export const obterKpis = async (req, res) => {
  const kpis = await secretariaService.obterKpis();

  return res.json(kpis);
};

export const listarPendencias = async (req, res) => {
  const pendencias = await secretariaService.listarPendencias(
    req.validado.query,
  );

  return res.json(pendencias);
};

export const registrarRetirada = async (req, res) => {
  const { compraId } = req.validado.params;
  const { itens } = req.validado.body;

  const resultado = await secretariaService.registrarRetirada(compraId, itens);

  return res.status(201).json(resultado);
};
