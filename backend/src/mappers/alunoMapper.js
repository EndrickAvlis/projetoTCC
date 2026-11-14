const prioridadeMatricula = (status) => (status === "PENDENTE" ? 0 : 1);

export const mapearAluno = (aluno) => {
  if (!aluno) return null;

  const cursosOrdenados = [...(aluno.cursosAluno ?? [])].sort(
    (a, b) =>
      prioridadeMatricula(a.statusMatricula) -
      prioridadeMatricula(b.statusMatricula),
  );
  const matricula = cursosOrdenados[0];

  return {
    id: aluno.idAluno,
    nome: aluno.nomeAluno,
    status: aluno.statusAluno,
    cidade: aluno.cidadeAluno,
    sexo: aluno.sexoAluno,
    escolaridadePublica: aluno.escolaridadePublica,
    anoProcesso: aluno.anoProcesso,
    semestreProcesso: aluno.semestreProcesso,
    possuiVinculos: aluno._count
      ? aluno._count.compras > 0 || aluno._count.senhas > 0
      : false,
    cursoId: matricula?.codCurso,
    curso: matricula?.curso?.nomeCurso,
    periodo: matricula?.periodo,
    classificacao: matricula?.classificacao,
    anoEscolar: matricula?.anoEscolar,
    statusMatricula: matricula?.statusMatricula,
    cursos: cursosOrdenados.map((item) => ({
      id: item.codCurso,
      nome: item.curso?.nomeCurso,
      periodo: item.periodo,
      classificacao: item.classificacao,
      anoEscolar: item.anoEscolar,
      statusMatricula: item.statusMatricula,
    })),
  };
};

