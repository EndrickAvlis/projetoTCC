import AlunoService from "../services/alunoService.js";

const alunoService = new AlunoService();

export const mapearAluno = (aluno) => {
  if (!aluno) return null;
  const matricula = aluno.cursosAluno?.[0];

  return {
    id: aluno.idAluno,
    nome: aluno.nomeAluno,
    status: aluno.statusAluno,
    cidade: aluno.cidadeAluno,
    sexo: aluno.sexoAluno,
    escolaridadePublica: aluno.escolaridadePublica,
    cursoId: matricula?.codCurso,
    curso: matricula?.curso?.nomeCurso,
    periodo: matricula?.periodo,
    classificacao: matricula?.classificacao,
    statusMatricula: matricula?.statusMatricula,
    matriculas: (aluno.cursosAluno ?? []).map((vinculo) => ({
      cursoId: vinculo.codCurso,
      curso: vinculo.curso?.nomeCurso,
      classificacao: vinculo.classificacao,
      periodo: vinculo.periodo,
      anoEscolar: vinculo.anoEscolar,
    })),
  };
};

export const criarAluno = async (req, res) => {
  const aluno = await alunoService.cadastrarAluno(req.validado.body);

  return res.status(201).json({
    aluno: mapearAluno(aluno),
  });
};

export const listarAlunos = async (req, res) => {
  const resultado = await alunoService.buscarAlunos(req.validado.query);

  return res.json({
    alunos: resultado.alunos.map(mapearAluno),
    total: resultado.total,
    totalAtivos: resultado.totalAtivos,
    pagina: resultado.pagina,
    limite: resultado.limite,
  });
};

export const listarCidades = async (req, res) => {
  const cidades = await alunoService.listarCidades();
  return res.json({ cidades });
};

export const consultarAluno = async (req, res) => {
  const aluno = await alunoService.buscarAlunoPorId(req.validado.params.id);

  return res.json({
    aluno: mapearAluno(aluno),
  });
};

export const editarAluno = async (req, res) => {
  const aluno = await alunoService.atualizarAluno(
    req.validado.params.id,
    req.validado.body,
  );

  return res.json({
    aluno: mapearAluno(aluno),
  });
};

export const adicionarMatricula = async (req, res) => {
  const vinculo = await alunoService.vincularAlunoCurso(
    req.validado.params.id,
    req.validado.body.cursoId,
  );

  return res.status(201).json({
    matricula: {
      cursoId: vinculo.codCurso,
      alunoId: vinculo.codAluno,
      curso: {
        id: vinculo.curso.idCurso,
        nome: vinculo.curso.nomeCurso,
      },
    },
  });
};

export const removerMatricula = async (req, res) => {
  const { id } = req.validado.params;
  const { cursoId } = req.validado.body;

  await alunoService.desvincularAlunoCurso(cursoId, id);

  return res.status(204).send();
};

export const importarAlunos = async (req, res) => {
  const resultado = await alunoService.importarAlunos(req.validado.body);

  return res.status(201).json(resultado);
};
