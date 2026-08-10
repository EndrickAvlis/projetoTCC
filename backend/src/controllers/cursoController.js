import CursoService from "../services/CursoService.js";

const cursoService = new CursoService();

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



export const listarCursosAdmin = async (req, res) => {
  const cursos = await cursoService.listarCursos(req.validado.query);

  return res.json({
    cursos: cursos.map(mapearCursoResposta),
    total: cursos.length,
  });
};

export const criarCursoAdmin = async (req, res) => {
  const curso = await cursoService.criarCurso(req.validado.body);

  return res.status(201).json({
    curso: mapearCursoResposta(curso),
  });
};

export const atualizarNomeCursoAdmin = async (req, res) => {
  const { cursoId } = req.validado.params;
  const { nome } = req.validado.body;
  const curso = await cursoService.atualizarNomeCurso(cursoId, nome);

  return res.json({
    curso: mapearCursoResposta(curso),
  });
};

export const alterarArquivamentoCurso = async (req, res) => {
  const { cursoId } = req.validado.params;
  const { arquivado } = req.validado.body;
  const curso = await cursoService.arquivarCurso(cursoId, arquivado);

  return res.json({
    curso: mapearCursoResposta(curso),
  });
};

export const criarPeriodoCursoAdmin = async (req, res) => {
  const { cursoId } = req.validado.params;
  const periodo = await cursoService.adicionarPeriodoCurso(
    cursoId,
    req.validado.body,
  );

  return res.status(201).json({
    periodo: mapearPeriodoResposta(periodo),
  });
};

export const atualizarPeriodoCursoAdmin = async (req, res) => {
  const { cursoId, periodoId } = req.validado.params;
  const periodo = await cursoService.atualizarPeriodoCurso(
    cursoId,
    periodoId,
    req.validado.body,
  );

  return res.json({
    periodo: mapearPeriodoResposta(periodo),
  });
};
