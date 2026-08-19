import { useState } from "react";
import Alert from "../../../../components/ui/Alert";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";

const EditarCursoModal = ({
  curso,
  onFechar,
  onSalvar,
  salvando = false,
  erro = null,
}) => {
  const [nome, setNome] = useState(curso?.nome ?? "");

  const salvar = (evento) => {
    evento.preventDefault();
    onSalvar(nome.trim());
  };

  return (
    <Modal
      aberto={Boolean(curso)}
      onFechar={() => !salvando && onFechar()}
      titulo="Editar curso"
      largura="max-w-lg"
    >
      <form onSubmit={salvar} className="space-y-5">
        {erro && <Alert type="error" message={erro} />}

        <Input
          label="Nome do curso"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          required
          autoFocus
        />

        <footer className="flex justify-end gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={onFechar}
            disabled={salvando}
          >
            Cancelar
          </Button>

          <Button type="submit" loading={salvando}>
            Salvar alterações
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default EditarCursoModal;
