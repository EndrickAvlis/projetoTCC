import CursoService from "../services/cursoService copy.js";
import * as validatorCursos from "../validators/ValidatorCursos.js";

const cursoService = new CursoService();

export const listarCursosAdmin = async (req, res) => {
  const busca = req.query.busca;
  const arquivado = req.query.arquivado;

  if (arquivado !== undefined && arquivado !== "true" && arquivado !== "false"){
    return res.status(400).json({
      message: "O filtro arquivado deve ser true ou false.",
      code: "FILTRO_ARQUIVADO_INVALIDO",
    });
  }

  try{
    const listaCursos = await cursoService.listar(busca, arquivado);
    return res.status(200).json(listaCursos);
  } catch (error){
    return responderErroBanco(res, error, "Erro ao listar cursos: ");
  }
}

export const criarCursoAdmin = async (req, res) => {
  try{
    const cursoCriado = await cursoService.criar(req.body);

    return res.status(201).json(cursoCriado);
  } catch (error){
    return responderErroBanco(res, error, "Erro ao criar curso: ");
  }
}