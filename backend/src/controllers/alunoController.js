import AlunoService from "../services/AlunoService.js";

const alunoService = new AlunoService();

const mapearAluno = (aluno) => ({
  id: aluno.idAluno,
  cpf: aluno.cpfAluno,
  ano: aluno.anoAluno,
  nome: aluno.nomeAluno,
  cursos:
    aluno.cursosAluno?.map((item) => ({
      id: item.curso.idCurso,
      nome: item.curso.nomeCurso,
    })) ?? [],
});

export const criarAluno = async (req, res) => {
  const aluno = await alunoService.cadastrarAluno(req.validado.body);

  return res.status(201).json({
    aluno: mapearAluno(aluno),
  });
};

export const listarAlunos = async (req, res) => {
  const alunos = await alunoService.buscarAlunos(
    req.validado.query.nome,
  );

  return res.json({
    alunos: alunos.map(mapearAluno),
    total: alunos.length,
  });
};

export const consultarAluno = async (req, res) => {
  const aluno = await alunoService.buscarAlunoPorId(
    req.validado.params.id,
  );

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