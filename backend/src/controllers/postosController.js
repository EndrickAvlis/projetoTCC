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