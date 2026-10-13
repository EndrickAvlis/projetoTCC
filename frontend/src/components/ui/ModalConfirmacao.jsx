import Modal from "./Modal";
import Button from "./button";
import { FiAlertTriangle, FiAlertCircle, FiHelpCircle } from "react-icons/fi";

const ICONES_VARIANTE = {
  danger: <FiAlertTriangle size={24} className="text-status-danger" />,
  warning: <FiAlertCircle size={24} className="text-status-warning" />,
  primary: <FiHelpCircle size={24} className="text-primary" />,
};

const CORES_FUNDO_ICONE = {
  danger: "bg-status-danger-bg",
  warning: "bg-status-warning-bg",
  primary: "bg-status-info-bg",
};

const ModalConfirmacao = ({
  aberto,
  onFechar,
  onConfirmar,
  titulo = "Confirmar ação",
  mensagem = "Tem certeza que deseja prosseguir com esta ação?",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  variante = "danger",
  carregando = false,
  icone = null,
  children = null,
  largura = "max-w-md",
}) => {
  const iconeRenderizado = icone || ICONES_VARIANTE[variante] || ICONES_VARIANTE.danger;
  const fundoIcone = CORES_FUNDO_ICONE[variante] || CORES_FUNDO_ICONE.danger;

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <Button
        type="button"
        variant="secondary"
        onClick={onFechar}
        disabled={carregando}
      >
        {textoCancelar}
      </Button>

      <Button
        type="button"
        variant={variante}
        onClick={onConfirmar}
        loading={carregando}
      >
        {textoConfirmar}
      </Button>
    </div>
  );

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={titulo}
      footer={footer}
      largura={largura}
      conteudoRolavel={false}
    >
      <div className="flex gap-4 items-start">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${fundoIcone}`}
        >
          {iconeRenderizado}
        </div>

        <div className="flex-1 space-y-2">
          {typeof mensagem === "string" ? (
            <p className="text-sm text-text-secondary leading-relaxed">
              {mensagem}
            </p>
          ) : (
            mensagem
          )}

          {children}
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirmacao;
