import * as React from "react";

import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import InputMoeda from "../../../../../components/ui/InputMoeda";
import Modal from "../../../../../components/ui/Modal";

const dadosIniciais = {
  preco: 0,
  quantidade: "",
};

const AdicionarConfiguracaoArmarioModal = ({
  aberto,
  onFechar,
  onSalvar,
  salvando = false,
  erro = null,
}) => {
  const [dados, setDados] = React.useState(dadosIniciais);
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
    const preco = Number(dados.preco);
    const quantidade = Number(dados.quantidade);

    if (!Number.isFinite(preco) || preco <= 0) {
      novosErros.preco = "Informe um preço maior que zero.";
    }

    if (
      dados.quantidade === "" ||
      !Number.isInteger(quantidade) ||
      quantidade < 0
    ) {
      novosErros.quantidade =
        "Informe uma quantidade inteira maior ou igual a zero.";
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
      preco: Number(dados.preco),
      quantidade: Number(dados.quantidade),
    });
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo="Configurar armário"
      largura="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {erro && <Alert type="error" message={erro} />}

        <p className="text-sm text-text-secondary">
          Informe o preço e a quantidade inicial do único armário disponível.
          Ele permanecerá indisponível na APM até ser disponibilizado.
        </p>

        <InputMoeda
          label="Preço"
          valor={dados.preco}
          onChange={(valor) => atualizarCampo("preco", valor)}
          error={erros.preco}
          disabled={salvando}
          required
          autoFocus
        />

        <Input
          label="Quantidade disponível"
          type="number"
          min="0"
          step="1"
          value={dados.quantidade}
          onChange={(evento) =>
            atualizarCampo("quantidade", evento.target.value)
          }
          error={erros.quantidade}
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

          <Button type="submit" loading={salvando}>
            Salvar configuração
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default AdicionarConfiguracaoArmarioModal;
