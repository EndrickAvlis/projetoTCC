import CursoService from "../services/cursoService.js";

const cursoService = new CursoService();

const mapearPeriodoResposta = (periodo) => ({
  id: periodo.idPeriodo,
  periodo: periodo.periodo,
  vagasTotais: periodo.vagasTotais,
  matriculaAtiva: periodo.matriculaAtiva,
  possuiVinculos: Boolean(periodo.possuiVinculos),
});

const mapearCursoResposta = (curso) => ({
  id: curso.idCurso,
  nome: curso.nomeCurso,
  arquivado: curso.arquivado,
  possuiVinculos: Boolean(curso._count?.cursosAluno > 0),
  periodos: curso.periodos.map(mapearPeriodoResposta),
});

export const listarCursos = async (req, res) => {
  const cursos = await cursoService.listar(req.validado.query);

  return res.json({
    cursos: cursos.map(mapearCursoResposta),
    total: cursos.length,
  });
};

export const criarCurso = async (req, res) => {
  const curso = await cursoService.criar(req.validado.body);

  return res.status(201).json({
    curso: mapearCursoResposta(curso),
  });
};

export const atualizarCurso = async (req, res) => {
  const { cursoId } = req.validado.params;
  const curso = await cursoService.atualizar(cursoId, req.validado.body);

  return res.json({
    curso: mapearCursoResposta(curso),
  });
};

export const excluirCurso = async (req, res) => {
  await cursoService.excluir(req.validado.params.cursoId);

  return res.status(204).send();
};

export const criarPeriodo = async (req, res) => {
  const { cursoId } = req.validado.params;
  const periodo = await cursoService.criarPeriodo(cursoId, req.validado.body);

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

export const excluirPeriodo = async (req, res) => {
  const { cursoId, periodoId } = req.validado.params;
  await cursoService.excluirPeriodo(cursoId, periodoId);

  return res.status(204).send();
};
