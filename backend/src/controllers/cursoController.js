import CursosService from "../services/cursoService.js";

const cursoService = new CursosService();

const mapearPeriodoResposta = (periodo) => ({
  id: periodo.idPeriodo,
  periodo: periodo.periodo,
  vagasTotais: periodo.vagasTotais,
  matriculaAtiva: periodo.matriculaAtiva,
});

const mapearCursoResposta = (curso) => ({
  id: curso.idCurso,
  nome: curso.nomeCurso,
  arquivado: curso.arquivado,
  periodos: curso.periodos.map(mapearPeriodoResposta),
});



export const listarCursos = async (req, res) => {
  const cursos = await cursoService.listarCursos(req.validado.query);

  return res.json({
    cursos: cursos.map(mapearCursoResposta),
    total: cursos.length,
  });
};

export const criarCurso = async (req, res) => {
  const curso = await cursoService.criarCurso(req.validado.body);

  return res.status(201).json({
    curso: mapearCursoResposta(curso),
  });
};

export const atualizarCurso = async (req, res) => {
  const { cursoId } = req.validado.params;
  const curso = await cursoService.atualizarCurso(cursoId, req.validado.body);

  return res.json({
    curso: mapearCursoResposta(curso),
  });
};

export const criarPeriodo = async (req, res) => {
  const { cursoId } = req.validado.params;
  const periodo = await cursoService.criarPeriodo(
    cursoId,
    req.validado.body,
  );

  return res.status(201).json({
    periodo: mapearPeriodoResposta(periodo),
  });
};

export const atualizarPeriodo = async (req, res) => {
  const { cursoId, periodoId } = req.validado.params;
  const periodo = await cursoService.atualizarPeriodo(
    cursoId,
    periodoId,
    req.validado.body,
  );

  return res.json({
    periodo: mapearPeriodoResposta(periodo),
  });
};

export const excluirCurso = async (req, res) => {
  const { cursoId } = req.validado.params;
  const curso = await cursoService.excluir(cursoId);

  return res.json({
    curso: mapearCursoResposta(curso),
  });
};

