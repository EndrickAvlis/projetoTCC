export const mapearAluno = (aluno) => {
  if (!aluno) return null;
  const matricula =
    aluno.cursosAluno?.find((c) => c.statusMatricula === "PENDENTE") ||
    aluno.cursosAluno?.[0];

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
    anoEscolar: matricula?.anoEscolar,
    statusMatricula: matricula?.statusMatricula,
  };
};

