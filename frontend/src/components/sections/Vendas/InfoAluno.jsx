// Identificação resumida do aluno atendido no posto APM.
const InfoAluno = ({ aluno }) => {
  const cursoComAno = [aluno.ano && `${aluno.ano}º`, aluno.curso]
    .filter(Boolean)
    .join(" ");
  const identificacaoAcademica = [cursoComAno, aluno.periodo]
    .filter(Boolean)
    .join(" — ");

  return (
    <section className="bg-[#E9EAEC] border border-[#B9C2CE] rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Informações do aluno">
      <DadoAluno titulo="Nome" valor={aluno.nome || "Aluno não identificado"} />
      <DadoAluno titulo="Curso" valor={identificacaoAcademica || "—"} />
      <DadoAluno titulo="CPF" valor={aluno.cpf || "—"} />
    </section>
  );
};

const DadoAluno = ({ titulo, valor }) => (
  <div>
    <p className="text-sm text-gray-500">{titulo}</p>
    <p className="font-semibold text-gray-900">{valor}</p>
  </div>
);

export default InfoAluno;
