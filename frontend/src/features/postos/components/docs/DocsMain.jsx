import Alert from "../../../../components/ui/Alert";
import { useToast } from "../../../../context/toastContext";
import { formatarPeriodo } from "../../../../utils/formatters";
import { OPCOES_SEXO } from "../../constants/triagem";
import { useAtendimento } from "../../context/atendimentoContext";
import AtendimentoActions from "../../layout/AtendimentoActions";

const formatarSexo = (sexo) =>
  OPCOES_SEXO.find((opcao) => opcao.value === sexo)?.label || sexo;

const formatarClassificacao = (classificacao) => {
  const numero = Number(classificacao);
  return Number.isInteger(numero) && numero > 0 ? `${numero}º Lugar` : "";
};

export const DocsMain = () => {
  const toast = useToast();
  const { dadosAluno, fase, carregando, finalizarAtendimento } =
    useAtendimento();

  const podeFinalizar = fase === "iniciada" && Boolean(dadosAluno) && !carregando;

  const handleFinalizar = async () => {
    if (!podeFinalizar) return;

    try {
      await finalizarAtendimento();
      toast.confirmacao("Matrícula concluída com sucesso");
    } catch (erro) {
      toast.erro(erro.message);
    }
  };

  const campos = [
    {
      label: "Nome do Aluno",
      valor: dadosAluno?.nome,
      span: "sm:col-span-2 lg:col-span-8",
    },
    {
      label: "Cidade de Origem",
      valor: dadosAluno?.cidade,
      span: "sm:col-span-2 lg:col-span-4",
    },
    {
      label: "Sexo",
      valor: formatarSexo(dadosAluno?.sexo),
      span: "sm:col-span-1 lg:col-span-6",
    },
    {
      label: "Escolaridade Pública",
      valor: dadosAluno?.escolaridadePublica ? "Sim" : "Não",
      span: "sm:col-span-1 lg:col-span-6",
    },
    {
      label: "Curso Vinculado",
      valor: dadosAluno?.curso,
      span: "sm:col-span-2 lg:col-span-7",
    },
    {
      label: "Período",
      valor: formatarPeriodo(dadosAluno?.periodo),
      span: "sm:col-span-1 lg:col-span-3",
    },
    {
      label: "Classificação",
      valor: formatarClassificacao(dadosAluno?.classificacao),
      span: "sm:col-span-1 lg:col-span-2",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      <AtendimentoActions
        podeFinalizar={podeFinalizar}
        textoFinalizar={carregando ? "Concluindo..." : "Concluir Matrícula"}
        onFinalizar={handleFinalizar}
      />

      <div className="bg-surface rounded-lg border border-border p-6 shadow-xs flex flex-col gap-5">
        {fase !== "iniciada" || !dadosAluno ? (
          <p className="py-12 text-center text-text-secondary">
            {fase === "chamada"
              ? "Inicie o atendimento da senha chamada para conferir os dados do aluno."
              : "Aguardando chamada de uma senha para conferência de documentos."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
              {campos.map((campo) => (
                <div
                  key={campo.label}
                  className={`flex flex-col gap-1 rounded-lg border border-border bg-surface-muted/40 px-4 py-3.5 ${campo.span || ""}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {campo.label}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {campo.valor || "Não informado"}
                  </span>
                </div>
              ))}
            </div>

            <Alert
              type="info"
              message="Após concluir a matrícula, o aluno aparecerá como ativo no sistema."
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DocsMain;
