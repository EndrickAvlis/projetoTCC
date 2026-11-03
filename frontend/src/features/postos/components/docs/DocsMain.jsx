import { useToast } from "../../../../context/toastContext";
import { useAtendimento } from "../../context/atendimentoContext";
import { useState } from "react";
import AtendimentoActions from "../../layout/AtendimentoActions";

export const DocsMain = () => {
  const toast = useToast();
  const { senhaAtual, dadosAluno, fase, finalizarAtendimento } =
    useAtendimento();
  const [salvando, setSalvando] = useState(false);

  const podeFinalizar = fase === "iniciada" && Boolean(dadosAluno) && !salvando;

  const handleFinalizar = async () => {
    try {
      setSalvando(true);
      await finalizarAtendimento();
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setSalvando(false);
    }
  };

  const campos = [
    { label: "Nome do Aluno", valor: dadosAluno?.nome, span: "md:col-span-2" },
    { label: "Cidade", valor: dadosAluno?.cidade },
    { label: "Sexo", valor: dadosAluno?.sexo },
    {
      label: "Escolaridade Pública",
      valor: dadosAluno?.escolaridadePublica ? "Sim" : "Não",
    },
    { label: "Situação Cadastral", valor: dadosAluno?.status },
    { label: "Curso", valor: dadosAluno?.curso, span: "md:col-span-2" },
    { label: "Período", valor: dadosAluno?.periodo },
    { label: "Classificação", valor: dadosAluno?.classificacao },
    { label: "Situação da Matrícula", valor: dadosAluno?.statusMatricula },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      <AtendimentoActions
        podeFinalizar={podeFinalizar}
        textoFinalizar={salvando ? "Concluindo..." : "Concluir Matrícula"}
        onFinalizar={handleFinalizar}
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
