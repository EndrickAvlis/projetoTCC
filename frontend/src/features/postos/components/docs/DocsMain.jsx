import { useState } from "react";
import Alert from "../../../../components/ui/Alert";
import Badge from "../../../../components/ui/Badge";
import ConfirmarModal from "../../../../components/ui/ConfirmarModal";
import { useToast } from "../../../../context/toastContext";
import { formatarPeriodo, formatarSenha } from "../../../../utils/formatters";
import { OPCOES_ANO_ESCOLAR, OPCOES_SEXO } from "../../constants/triagem";
import { useAtendimento } from "../../context/atendimentoContext";
import AtendimentoActions from "../../layout/AtendimentoActions";

const formatarSexo = (sexo) => {
  if (!sexo) return "";
  return OPCOES_SEXO.find((opcao) => opcao.value === sexo)?.label || sexo;
};

const formatarAnoEscolar = (anoEscolar) => {
  if (!anoEscolar) return "";
  return (
    OPCOES_ANO_ESCOLAR.find((opcao) => opcao.value === String(anoEscolar))
      ?.label || `${anoEscolar}º Ano`
  );
};

const formatarClassificacao = (classificacao) => {
  const numero = Number(classificacao);
  return Number.isInteger(numero) && numero > 0 ? `${numero}º Lugar` : "";
};

const formatarEscolaridadePublica = (escolaridadePublica) => {
  if (escolaridadePublica === true) {
    return (
      <Badge variant="info" size="sm" dot className="w-fit">
        Sim (Escola pública)
      </Badge>
    );
  }
  if (escolaridadePublica === false) return "Não";
  return "";
};

export const DocsMain = () => {
  const toast = useToast();
  const {
    senhaAtual,
    dadosAluno,
    fase,
    carregando,
    finalizarAtendimento,
  } = useAtendimento();
  const [salvando, setSalvando] = useState(false);
  const [modalConfirmarAberto, setModalConfirmarAberto] = useState(false);

  const podeFinalizar =
    fase === "iniciada" && Boolean(dadosAluno?.id) && !carregando && !salvando;
  const modalVisivel =
    modalConfirmarAberto && fase === "iniciada" && Boolean(dadosAluno?.id);

  const handleConfirmarConclusao = async () => {
    if (!podeFinalizar) return;

    setSalvando(true);
    try {
      await finalizarAtendimento();
      setModalConfirmarAberto(false);
      toast.sucesso("Matrícula concluída com sucesso.");
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setSalvando(false);
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
      span: "sm:col-span-1 lg:col-span-4",
    },
    {
      label: "Escolaridade Pública",
      valor: formatarEscolaridadePublica(dadosAluno?.escolaridadePublica),
      span: "sm:col-span-1 lg:col-span-4",
    },
    {
      label: "Ano Escolar",
      valor: formatarAnoEscolar(dadosAluno?.anoEscolar),
      span: "sm:col-span-2 lg:col-span-4",
    },
    {
      label: "Curso Vinculado",
      valor: dadosAluno?.curso,
      span: "sm:col-span-2 lg:col-span-6",
    },
    {
      label: "Período",
      valor: formatarPeriodo(dadosAluno?.periodo),
      span: "sm:col-span-1 lg:col-span-3",
    },
    {
      label: "Classificação",
      valor: formatarClassificacao(dadosAluno?.classificacao),
      span: "sm:col-span-1 lg:col-span-3",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      <AtendimentoActions
        podeFinalizar={podeFinalizar}
        textoFinalizar={salvando ? "Concluindo..." : "Concluir Matrícula"}
        onFinalizar={() => podeFinalizar && setModalConfirmarAberto(true)}
      />

      <div className="bg-surface rounded-lg border border-border p-6 shadow-xs flex flex-col gap-5">
        {fase !== "iniciada" ? (
          <p className="py-12 text-center text-text-secondary">
            {fase === "chamada"
              ? "Inicie o atendimento da senha chamada para conferir os dados do aluno."
              : "Aguardando chamada de uma senha para conferência de documentos."}
          </p>
        ) : !dadosAluno ? (
          <Alert
            type="error"
            message="Nenhum aluno vinculado a esta senha. Cancele o atendimento ou contate o administrador."
          />
        ) : (
          <>
            <div className="border-b border-border pb-3">
              <h2 className="text-base font-semibold text-text-primary">
                Dados do Aluno e Matrícula
              </h2>
            </div>

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

      <ConfirmarModal
        aberto={modalVisivel}
        onFechar={() => setModalConfirmarAberto(false)}
        onConfirmar={handleConfirmarConclusao}
        titulo="Concluir Matrícula"
        textoConfirmar="Confirmar conclusão"
        textoCancelar="Voltar"
        variante="success"
        salvando={salvando}
      >
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            Confirma a conclusão da matrícula após a conferência dos documentos?
            Esta ação ativará o aluno e a matrícula no sistema.
          </p>

          <div className="rounded-lg border border-border bg-surface-muted/40 p-3.5 space-y-1.5">
            <p className="text-text-primary">
              <span className="font-semibold">Senha:</span>{" "}
              {formatarSenha(senhaAtual?.codigo)}
            </p>
            <p className="text-text-primary">
              <span className="font-semibold">Aluno:</span>{" "}
              {dadosAluno?.nome || "Não informado"}
            </p>
            <p className="text-text-primary">
              <span className="font-semibold">Curso:</span>{" "}
              {dadosAluno?.curso || "Não informado"}
              {dadosAluno?.periodo
                ? ` (${formatarPeriodo(dadosAluno.periodo)})`
                : ""}
            </p>
          </div>
        </div>
      </ConfirmarModal>
    </div>
  );
};

export default DocsMain;
