import * as React from "react";

import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import InputMoeda from "../../../../../components/ui/InputMoeda";
import Modal from "../../../../../components/ui/Modal";

const EditarUniformeModal = ({
  uniforme,
  onFechar,
  onSalvar,
  salvando = false,
  erro = null,
}) => {
  const [dados, setDados] = React.useState({
    nome: uniforme?.nome ?? "",
    preco: Number(uniforme?.preco ?? 0),
  });

  const [erros, setErros] = React.useState({});

  const atualizarCampo = (campo, valor) => {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));

    setErros((errosAtuais) => ({
      ...errosAtuais,
      [campo]: "",
    }));
  };

  const validarFormulario = () => {
    const novosErros = {};

    const nome = dados.nome.trim();
    const preco = Number(dados.preco);

    if (!nome) {
      novosErros.nome =
        "Informe o tamanho do uniforme.";
    } else if (nome.length > 50) {
      novosErros.nome =
        "O tamanho deve ter no máximo 50 caracteres.";
    }

    if (!Number.isFinite(preco) || preco <= 0) {
      novosErros.preco =
        "Informe um preço maior que zero.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    onSalvar({
      nome: dados.nome.trim(),
      preco: Number(dados.preco),
    });
  };

  return (
    <Modal
      aberto={Boolean(uniforme)}
      onFechar={() => !salvando && onFechar()}
      titulo="Editar uniforme"
      largura="max-w-lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {erro && (
          <Alert
            type="error"
            message={erro}
          />
        )}

        <Input
          label="Tamanho"
          value={dados.nome}
          onChange={(evento) =>
            atualizarCampo(
              "nome",
              evento.target.value,
            )
          }
          placeholder="Ex.: GG"
          error={erros.nome}
          disabled={salvando}
          required
          autoFocus
        />

        <InputMoeda
          label="Preço"
          valor={dados.preco}
          onChange={(valor) =>
            atualizarCampo("preco", valor)
          }
          error={erros.preco}
          disabled={salvando}
          required
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

          <Button
            type="submit"
            loading={salvando}
          >
            Salvar alterações
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default EditarUniformeModal;