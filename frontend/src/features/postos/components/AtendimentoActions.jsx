import * as React from "react";
import {
  FiPlay,
  FiRotateCw,
  FiCheck,
  FiSkipForward,
  FiClock,
} from "react-icons/fi";
import Button from "../../../components/ui/button";

export const AtendimentoActions = ({
  senhaAtual = null,
  fase = "sem_senha",
  carregando = false,
  podeFinalizar = true,
  permitePular = false,
  textoFinalizar = "Finalizar Atendimento",
  textoIniciar = "Iniciar Atendimento",
  onIniciar,
  onRechamar,
  onFinalizar,
  onPular,
  className = "",
}) => {
  const numeroSenha = senhaAtual?.numero ?? senhaAtual?.codigo ?? "";
  const isPrioritaria = Boolean(
    senhaAtual?.prioritaria ?? senhaAtual?.tipoSenha,
  );

  const renderIdentificacao = () => {
    if (fase === "sem_senha" || !senhaAtual) {
      return (
        <div className="flex items-center gap-2 text-text-secondary">
          <FiClock className="h-4 w-4 opacity-60" />
          <span className="text-lg font-semibold text-text-secondary">
            Aguardando senha
          </span>
        </div>
      );
    }

    const rotuloStatus =
      fase === "iniciada" ? "Em atendimento" : "Senha chamada";

    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {rotuloStatus}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-primary">
            Senha {numeroSenha}
          </span>
          {isPrioritaria && (
            <span className="rounded-full bg-status-warning-bg px-2.5 py-0.5 text-xs font-semibold text-status-warning border border-status-warning/30">
              Prioritária
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center">{renderIdentificacao()}</div>

      <div className="flex flex-wrap items-center gap-2">
        {fase === "chamada" && onRechamar && (
          <Button
            variant="secondary"
            size="md"
            leftIcon={<FiRotateCw />}
            onClick={onRechamar}
            disabled={carregando}
          >
            Rechamar
          </Button>
        )}

        {fase === "chamada" && permitePular && onPular && (
          <Button
            variant="secondary"
            size="md"
            leftIcon={<FiSkipForward />}
            onClick={onPular}
            disabled={carregando}
          >
            Pular Atendimento
          </Button>
        )}

        {fase !== "iniciada" && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<FiPlay />}
            onClick={onIniciar}
            disabled={fase === "sem_senha" || !senhaAtual || carregando}
          >
            {textoIniciar}
          </Button>
        )}

        {fase === "iniciada" && onRechamar && (
          <Button
            variant="secondary"
            size="md"
            leftIcon={<FiRotateCw />}
            onClick={onRechamar}
            disabled={carregando}
          >
            Rechamar
          </Button>
        )}

        {fase === "iniciada" && onFinalizar && (
          <Button
            variant="success"
            size="md"
            leftIcon={<FiCheck />}
            onClick={onFinalizar}
            disabled={!podeFinalizar || carregando}
          >
            {textoFinalizar}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AtendimentoActions;
