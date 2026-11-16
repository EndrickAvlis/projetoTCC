import CompraService from "../services/compraService.js";

const compraService = new CompraService();

export const registrarCompra = async (req, res) => {
  const codVoluntario = req.usuario.id;
  const { codAluno, itens, pagamentos, valorContribuicao } = req.validado.body;

  const registroDeCompra = await compraService.registrarCompra(
    codVoluntario,
    codAluno,
    itens,
    pagamentos,
    valorContribuicao,
  );

  return res.status(201).json({
    mensagem: registroDeCompra.mensagem,
    codigoDeRetirada: registroDeCompra.codigoDeRetirada,
  });
};
