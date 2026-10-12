import Alert from "./Alert";
import Button from "./Button";
import Modal from "./Modal";

const ConfirmarModal = ({
  aberto,
  onFechar,
  onConfirmar,
  titulo = "Confirmar ação",
  mensagem = "Tem certeza de que deseja prosseguir?",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  variante = "danger", // "danger" | "success" | "primary"
  salvando = false,
  erro = null,
  largura = "max-w-lg",
  children,
}) => {
  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={titulo}
      largura={largura}
    >
      <div className="space-y-5">
        {erro && <Alert type="error" message={erro} />}

        {children ? (
          children
        ) : (
          <p className="text-text-secondary">{mensagem}</p>
        )}

        <footer className="flex justify-end gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={onFechar}
            disabled={salvando}
          >
            {textoCancelar}
          </Button>

          <Button
            type="button"
            variant={variante}
            onClick={onConfirmar}
            loading={salvando}
          >
            {textoConfirmar}
          </Button>
        </footer>
      </div>
    </Modal>
  );
};

export default ConfirmarModal;