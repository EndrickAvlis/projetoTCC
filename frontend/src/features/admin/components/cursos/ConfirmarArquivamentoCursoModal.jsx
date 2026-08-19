import Alert from "../../../../components/ui/Alert";
import Button from "../../../../components/ui/Button";
import Modal from "../../../../components/ui/Modal";

const ConfirmarArquivamentoCursoModal = ({
  curso,
  onFechar,
  onConfirmar,
  salvando = false,
  erro = null,
}) => (
  <Modal
    aberto={Boolean(curso)}
    onFechar={() => !salvando && onFechar()}
    titulo={curso?.arquivado ? "Desarquivar curso" : "Arquivar curso"}
    largura="max-w-lg"
  >
    <div className="space-y-5">
      {erro && <Alert type="error" message={erro} />}

      <p className="text-text-secondary">
        {curso?.arquivado
          ? `Deseja desarquivar o curso ${curso.nome}?`
          : `Deseja arquivar o curso ${curso?.nome}? As matrículas dos períodos serão fechadas.`}
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
          variant={curso?.arquivado ? "success" : "danger"}
          onClick={onConfirmar}
          loading={salvando}
        >
          {curso?.arquivado ? "Desarquivar" : "Arquivar"}
        </Button>
      </footer>
    </div>
  </Modal>
);

export default ConfirmarArquivamentoCursoModal;
