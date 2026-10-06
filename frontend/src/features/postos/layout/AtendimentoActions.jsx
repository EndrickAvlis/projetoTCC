import { FiPlay, FiRotateCw, FiCheck, FiClock } from "react-icons/fi";
import Button from "../../../components/ui/Button";
import { formatarSenha } from "../../../utils/formatters";
import { useAtendimento } from "../context/atendimentoContext";

export const AtendimentoActions = ({
  podeFinalizar = true,
  textoFinalizar = "Finalizar Atendimento",
  textoIniciar = "Iniciar Atendimento",
  onFinalizar,
  className = "",
}) => {
  const { senhaAtual, fase, carregando, iniciar, rechamar } =
    useAtendimento();

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 shadow-xs ${className}`}
    >
      <div className="flex items-center">
        {!senhaAtual ? (
          <div className="flex items-center gap-3 text-text-secondary">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-text-secondary border border-border">
              <FiClock className="h-5 w-5 opacity-70" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Atendimento
              </span>
              <div className="text-base font-semibold text-text-primary">
                Nenhuma senha em atendimento
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {fase === "iniciada" ? "Em atendimento" : "Senha chamada"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-primary">
                  Senha {formatarSenha(senhaAtual.numero)}
                </span>
                {senhaAtual.prioritaria && (
                  <span className="rounded-full bg-status-warning-bg px-2.5 py-0.5 text-xs font-semibold text-status-warning border border-status-warning/30">
                    Prioritária
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {fase === "chamada" && (
          <>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<FiRotateCw />}
              onClick={rechamar}
              disabled={carregando}
            >
              Rechamar
            </Button>

            <Button
              variant="primary"
              size="md"
              leftIcon={<FiPlay />}
              onClick={iniciar}
              disabled={carregando}
            >
              {textoIniciar}
            </Button>
          </>
        )}

        {fase === "iniciada" && (
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
