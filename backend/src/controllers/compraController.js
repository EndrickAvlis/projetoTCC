import CompraService from "../services/compraService.js";

const compraService = new CompraService();

export const registrarCompra = async (req, res, next) => {
    const codVoluntario = req.usuario.id;
    const codAluno = req.validado.body.codAluno;
    const itens = req.validado.body.itens;
    const pagamentos = req.validado.body.pagamentos;
    const contribuicao = req.validado.body.valorContribuicao;

    const registroDeCompra = await compraService.registrarCompra(codVoluntario, codAluno, itens, pagamentos, contribuicao)

    res.status(201).json({
        mensagem: registroDeCompra.mensagem,
        codigoDeRetirada: registroDeCompra.codigoDeRetirada
    }).send();
}