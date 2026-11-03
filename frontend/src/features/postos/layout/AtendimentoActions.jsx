import { FiPlay, FiRotateCw, FiCheck, FiClock, FiX } from "react-icons/fi";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import ConfirmarModal from "../../../components/ui/ConfirmarModal";
import { formatarSenha } from "../../../utils/formatters";
import { useAtendimento } from "../context/atendimentoContext";
import { useToast } from "../../../context/toastContext";

export const AtendimentoActions = ({
  podeFinalizar = true,
  textoFinalizar = "Finalizar Atendimento",
  textoIniciar = "Iniciar Atendimento",
  onFinalizar,
  className = "",
}) => {
  const {
    senhaAtual,
    fase,
    carregando,
    iniciarAtendimento,
    rechamarSenha,
    cancelarAtendimento,
  } = useAtendimento();
  const toast = useToast();
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);

  const handleConfirmarCancelamento = async () => {
    try {
      await cancelarAtendimento();
      setModalCancelarAberto(false);
    } catch (err) {
      toast.erro(err.message);
    }
  };

  const handleRechamar = async () => {
    try {
      await rechamarSenha();
    } catch (err) {
      toast.erro(err.message);
    }
  };

  const handleIniciar = async () => {
    try {
      await iniciarAtendimento();
    } catch (err) {
      toast.erro(err.message);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface/30 backdrop-blur p-4 shadow-xs sticky top-0 z-10 ${className}`}
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
                  Senha {formatarSenha(senhaAtual.codigo)}
                </span>
                {senhaAtual.prioritaria && (
                  <Badge variant="warning" size="sm">
                    Prioritária
                  </Badge>
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
              variant="danger"
              size="md"
              leftIcon={<FiX />}
              onClick={() => setModalCancelarAberto(true)}
              disabled={carregando}
            >
              Cancelar
            </Button>

            <Button
              variant="secondary"
              size="md"
              leftIcon={<FiRotateCw />}
              onClick={handleRechamar}
              disabled={carregando}
            >
              Rechamar
            </Button>

            <Button
              variant="primary"
              size="md"
              leftIcon={<FiPlay />}
              onClick={handleIniciar}
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
      <ConfirmarModal
        aberto={modalCancelarAberto}
        onFechar={() => setModalCancelarAberto(false)}
        onConfirmar={handleConfirmarCancelamento}
        titulo="Cancelar Senha"
        mensagem={`Tem certeza de que deseja cancelar a Senha ${formatarSenha(senhaAtual?.codigo)} por não comparecimento? Esta ação é definitiva.`}
        textoConfirmar="Sim, cancelar"
        textoCancelar="Voltar"
        variante="danger"
        salvando={carregando}
      />
    </div>
  );
};

export default AtendimentoActions;
