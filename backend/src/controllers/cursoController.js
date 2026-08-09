import CursoService from "../services/cursoService.js";
import * as validatorCursos from "../validators/ValidatorCursos.js";

const cursoService = new CursoService();

//Formatações e validações
const formatarPeriodo = (periodoCurso) => ({
  id: periodoCurso.idPeriodo,
  periodo: periodoCurso.periodo,
  vagasTotais: periodoCurso.vagasTotais,
  matriculaAtiva: periodoCurso.matriculaAtiva,
});

const formatarCurso = (curso) => ({
  id: curso.idCurso,
  nome: curso.nomeCurso,
  arquivado: curso.arquivado,
  periodos: curso.periodos.map(formatarPeriodo),
});

const obterIdValido = (valor) => {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const normalizarFiltroArquivado = (valor) => {
  if (valor === undefined) {
    return {
      valido: true,
      arquivado: false,
    };
  }
  if (valor === "true") {
    return {
      valido: true,
      arquivado: true,
    };
  }
  if (valor === "false") {
    return {
      valido: true,
      arquivado: false,
    };
  }
  return {
    valido: false,
    arquivado: false,
  };
};

// Funções para os cursos e seus períodos
export const listarCursosAdmin = async (req, res) => {
  const filtroArquivado = normalizarFiltroArquivado(req.query.arquivado);

  if (!filtroArquivado.valido) {
    return res.status(400).json({
      message: "O filtro arquivado deve ser true ou false.",
      code: "FILTRO_ARQUIVADO_INVALIDO",
    });
  }

  const cursos = await cursoService.listarCursos({
    busca: req.query.busca ?? "",
    arquivado: filtroArquivado.arquivado,
  });

  return res.json({
    cursos: cursos.map(formatarCurso),
    total: cursos.length,
  });
};

export const criarCursoAdmin = async (req, res) => {
  const validacao = validatorCursos.validarDadosCurso(req.body);

  if (!validacao.valido) {
    return res.status(400).json({
      message: "Dados do curso inválidos.",
      code: "CURSO_INVALIDO",
      details: validacao.erros,
    });
  }

  const curso = await cursoService.criarCurso(validacao.dados);

  return res.status(201).json({
    curso: formatarCurso(curso),
  });
};

export const atualizarNomeCursoAdmin = async (req, res) => {
  const cursoId = obterIdValido(req.params.cursoId);

  if (!cursoId) {
    return res.status(400).json({
      message: "Informe um ID de curso válido.",
      code: "CURSO_ID_INVALIDO",
    });
  }

  const validacao = validatorCursos.validarNomeCurso(req.body.nome);

  if (!validacao.valido) {
    return res.status(400).json({
      message: "Nome do curso inválido.",
      code: "NOME_CURSO_INVALIDO",
      details: validacao.erros,
    });
  }

  const curso = await cursoService.atualizarNomeCurso(
    cursoId,
    validacao.dados.nome,
  );

  return res.json({
    curso: formatarCurso(curso),
  });
};

export const alterarArquivamentoCurso = async (req, res) => {
  const cursoId = obterIdValido(req.params.cursoId);

  if (!cursoId) {
    return res.status(400).json({
      message: "Informe um ID de curso válido.",
      code: "CURSO_ID_INVALIDO",
    });
  }

  const validacao = validatorCursos.validarArquivamentoCurso(
    req.body.arquivado,
  );

  if (!validacao.valido) {
    return res.status(400).json({
      message: "Dados de arquivamento inválidos.",
      code: "ARQUIVAMENTO_INVALIDO",
      details: validacao.erros,
    });
  }

  const curso = await cursoService.arquivarCurso(
    cursoId,
    validacao.dados.arquivado,
  );

  return res.json({
    curso: formatarCurso(curso),
  });
};

export const criarPeriodoCursoAdmin = async (req, res) => {
  const cursoId = obterIdValido(req.params.cursoId);

  if (!cursoId) {
    return res.status(400).json({
      message: "Informe um ID de curso válido.",
      code: "CURSO_ID_INVALIDO",
    });
  }

  const validacao = validatorCursos.validarPeriodoCurso(req.body);

  if (!validacao.valido) {
    return res.status(400).json({
      message: "Dados do período inválidos.",
      code: "PERIODO_INVALIDO",
      details: validacao.erros,
    });
  }

  const periodoCurso = await cursoService.adicionarPeriodoCurso(
    cursoId,
    validacao.dados,
  );

  return res.status(201).json({
    periodo: formatarPeriodo(periodoCurso),
  });
};

export const atualizarPeriodoCursoAdmin = async (req, res) => {
  const cursoId = obterIdValido(req.params.cursoId);
  const periodoId = obterIdValido(req.params.periodoId);

  if (!cursoId || !periodoId) {
    return res.status(400).json({
      message: "Informe IDs de curso e período válidos.",
      code: "ID_INVALIDO",
    });
  }

  const validacao = validatorCursos.validarPeriodoCurso(req.body);
  if (!validacao.valido) {
    return res.status(400).json({
      message: "Dados do período inválidos.",
      code: "PERIODO_INVALIDO",
      details: validacao.erros,
    });
  }

  const periodoCurso = await cursoService.atualizarPeriodoCurso(
    cursoId,
    periodoId,
    validacao.dados,
  );

  return res.json({
    periodo: formatarPeriodo(periodoCurso),
  });
};
