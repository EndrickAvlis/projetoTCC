import PostosService from "../services/postosService.js";

const postosService = new PostosService();

export const listarTodasAsFilas = async (req, res) => {
    const resultado = await postosService.ListarFilas();

    res.status(200).json(resultado).send();
}

export const listarAtendimento = async (req, res) => {
    const tipoPeriodo = req.validado.query.tipoPeriodo;
    const dataInicio = req.validado.query.dataInicio;
    const dataFim = req.validado.query.dataFim;
    const cursoId = req.validado.query.cursoId;
    const periodoCurso = req.validado.query.periodoCurso;
    const resultado = await postosService.listarAtendimento(tipoPeriodo, dataInicio, dataFim, cursoId, periodoCurso);

    res.status(200).json(resultado).send();
}

export const listarAuditoria = async (req, res) => {
    const busca = req.validado.query.busca;
    const status = req.validado.query.status;
    const tipoPeriodo = req.validado.query.tipoPeriodo;
    const dataInicio = req.validado.query.dataInicio;
    const dataFim = req.validado.query.dataFim;
    const pagina = req.validado.query.pagina;
    const limite = req.validado.query.limite;

    const resultado = await postosService.listarAuditoria(busca, status, tipoPeriodo, dataInicio, dataFim, pagina, limite);

    res.status(200).json(resultado).send();
}

export const trocarDePosto = async (req, res) => {
    const idSenha = req.validado.params.id;
    const postoDestino = req.validado.body.posto;

    const resultado = await postosService.trocarDePosto(idSenha, postoDestino);

    res.status(200).json(resultado).send();
}

export const cancelarSenha = async (req, res) => {
    const idSenha = req.validado.params.id;

    const resultado = await postosService.cancelarSenha(idSenha);

    res.status(200).json(resultado).send();
}