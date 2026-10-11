import { useAtendimento } from "../../context/atendimentoContext";
import AtendimentoActions from "../../layout/AtendimentoActions";

export const DocsMain = () => {
  const { senhaAtual, dadosAluno, fase, finalizar } = useAtendimento();

  const podeFinalizar = fase === "iniciada" && Boolean(dadosAluno);
  const matricula = dadosAluno?.matriculas?.[0];

  const campos = [
    { label: "Nome do Aluno", valor: dadosAluno?.nome, span: "md:col-span-2" },
    { label: "Cidade", valor: dadosAluno?.cidade },
    { label: "Sexo", valor: dadosAluno?.sexo },
    { label: "Escola Pública (Cota)", valor: dadosAluno?.escolaridadePublica ? "Sim" : "Não" },
    { label: "Situação Cadastral", valor: dadosAluno?.status },
    { label: "Curso", valor: matricula?.curso, span: "md:col-span-2" },
    { label: "Período", valor: matricula?.periodo },
    { label: "Classificação", valor: matricula?.classificacao },
    { label: "Situação da Matrícula", valor: matricula?.statusMatricula },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      <AtendimentoActions
        podeFinalizar={podeFinalizar}
        textoFinalizar="Concluir Matrícula"
        onFinalizar={finalizar}
      />

      <div className="bg-surface rounded-lg border border-border p-6 shadow-xs">
        {!senhaAtual || !dadosAluno ? (
          <p className="py-12 text-center text-text-secondary">
            Aguardando chamada de uma senha para conferência de documentos.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campos.map((campo) => (
              <div
                key={campo.label}
                className={`flex flex-col gap-1 ${campo.span || ""}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {campo.label}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {campo.valor || "Não informado"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocsMain;
