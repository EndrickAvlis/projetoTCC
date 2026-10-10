const InfoAluno = ({ aluno }) => {
  const detalhesCurso = [
    aluno?.curso,
    aluno?.ano && `${aluno.ano}º ano`,
    aluno?.periodo,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Aluno sendo atendido
        </span>
        <h2 className="text-lg font-bold text-text-primary">
          {aluno?.nome || "Aluno não identificado"}
        </h2>
      </div>

      <div className="text-right">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Curso e Período
        </span>
        <p className="text-sm font-medium text-text-primary">
          {detalhesCurso || "Não informado"}
        </p>
      </div>
    </div>
  );
};

export default InfoAluno;