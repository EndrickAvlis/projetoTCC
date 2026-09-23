import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/Button";
import Modal from "../../../../../components/ui/Modal";

const ConfirmarArquivamentoUniformeModal = ({
  uniforme,
  onFechar,
  onConfirmar,
  salvando = false,
  erro = null,
}) => {
  const estaArquivado =
    uniforme?.status === "arquivado";

  return (
    <Modal
      aberto={Boolean(uniforme)}
      onFechar={() => !salvando && onFechar()}
      titulo={
        estaArquivado
          ? "Desarquivar uniforme"
          : "Arquivar uniforme"
      }
      largura="max-w-lg"
    >
      <div className="space-y-5">
        {erro && (
          <Alert
            type="error"
            message={erro}
          />
        )}

        <p className="text-text-secondary">
          {estaArquivado
            ? `Deseja desarquivar o uniforme ${uniforme?.nome}?`
            : `Deseja arquivar o uniforme ${uniforme?.nome}? Ele deixará de aparecer entre os uniformes ativos.`}
        </p>

        <footer className="flex justify-end gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={onFechar}
            disabled={salvando}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant={
              estaArquivado
                ? "success"
                : "danger"
            }
            onClick={onConfirmar}
            loading={salvando}
          >
            {estaArquivado
              ? "Desarquivar"
              : "Arquivar"}
          </Button>
        </footer>
      </div>
    </Modal>
  );
};

export default ConfirmarArquivamentoUniformeModal;