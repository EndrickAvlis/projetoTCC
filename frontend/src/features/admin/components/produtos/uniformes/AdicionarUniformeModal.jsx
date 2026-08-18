import * as React from "react";

import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import InputMoeda from "../../../../../components/ui/InputMoeda";
import Modal from "../../../../../components/ui/Modal";

const dadosIniciais = {
  nome: "",
  preco: 0,
  quantidade: "",
};

const AdicionarUniformeModal = ({
  aberto,
  onFechar,
  onSalvar,
  salvando = false,
  erro = null,
}) => {
  const [dados, setDados] = React.useState(dadosIniciais);
  const [erros, setErros] = React.useState({});

  React.useEffect(() => {
    if (aberto) {
      setDados(dadosIniciais);
      setErros({});
    }
  }, [aberto]);

  const atualizarCampo = (campo, valor) => {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  };

  const validarFormulario = () => {
    const novosErros = {};

    const nome = dados.nome.trim();
    const preco = Number(dados.preco);
    const quantidade = Number(dados.quantidade);

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

    if (
      dados.quantidade === "" ||
      !Number.isInteger(quantidade) ||
      quantidade < 0
    ) {
      novosErros.quantidade =
        "Informe uma quantidade inteira maior ou igual a zero.";
    }

    const possuiErros =
      Object.keys(novosErros).length > 0;

    setErros(novosErros);

    return !possuiErros;
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    onSalvar({
      nome: dados.nome.trim(),
      preco: Number(dados.preco),
      quantidade: Number(dados.quantidade),
    });
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo="Adicionar uniforme"
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
          required
        />

        <Input
          label="Quantidade inicial"
          type="number"
          min="0"
          step="1"
          value={dados.quantidade}
          onChange={(evento) =>
            atualizarCampo(
              "quantidade",
              evento.target.value,
            )
          }
          error={erros.quantidade}
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
            Adicionar uniforme
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default AdicionarUniformeModal;
