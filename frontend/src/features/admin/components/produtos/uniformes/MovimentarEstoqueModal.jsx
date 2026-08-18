import * as React from "react";

import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Modal from "../../../../../components/ui/Modal";
import Select from "../../../../../components/ui/Select";

const OPCOES_MOVIMENTACAO = [
  {
    value: "adicionar",
    label: "Adicionar ao estoque",
  },
  {
    value: "diminuir",
    label: "Diminuir do estoque",
  },
  {
    value: "corrigir",
    label: "Corrigir estoque total",
  },
];

const dadosIniciais = {
  operacao: "adicionar",
  quantidade: "",
};

const MovimentarEstoqueModal = ({
  uniforme,
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

    setErros({});
  };

  const validarFormulario = () => {
    const novosErros = {};
    const quantidade = Number(dados.quantidade);
    const estoqueAtual = Number(uniforme?.quantidade ?? 0);

    if (
      dados.quantidade === "" ||
      !Number.isInteger(quantidade)
    ) {
      novosErros.quantidade =
        "Informe uma quantidade inteira.";
    } else if (
      dados.operacao === "corrigir" &&
      quantidade < 0
    ) {
      novosErros.quantidade =
        "O novo estoque deve ser maior ou igual a zero.";
    } else if (
      dados.operacao !== "corrigir" &&
      quantidade <= 0
    ) {
      novosErros.quantidade =
        "Informe uma quantidade maior que zero.";
    } else if (
      dados.operacao === "diminuir" &&
      quantidade > estoqueAtual
    ) {
      novosErros.quantidade =
        "A quantidade não pode ser maior que o estoque atual.";
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
      operacao: dados.operacao,
      quantidade: Number(dados.quantidade),
    });
  };

  return (
    <Modal
      aberto={Boolean(uniforme)}
      onFechar={() => !salvando && onFechar()}
      titulo="Movimentar estoque"
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

        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <p className="text-sm text-text-secondary">
            Uniforme
          </p>

          <p className="font-semibold text-text-primary">
            {uniforme?.nome}
          </p>

          <p className="mt-2 text-sm text-text-secondary">
            Estoque atual:{" "}
            <strong className="text-text-primary">
              {uniforme?.quantidade ?? 0}
            </strong>
          </p>
        </div>

        <Select
          label="Operação"
          value={dados.operacao}
          onChange={(evento) =>
            atualizarCampo(
              "operacao",
              evento.target.value,
            )
          }
          options={OPCOES_MOVIMENTACAO}
          placeholder=""
          disabled={salvando}
          required
        />

        <Input
          label={
            dados.operacao === "corrigir"
              ? "Novo estoque total"
              : "Quantidade"
          }
          type="number"
          min={
            dados.operacao === "corrigir"
              ? "0"
              : "1"
          }
          step="1"
          value={dados.quantidade}
          onChange={(evento) =>
            atualizarCampo(
              "quantidade",
              evento.target.value,
            )
          }
          error={erros.quantidade}
          disabled={salvando}
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

          <Button
            type="submit"
            loading={salvando}
          >
            Confirmar movimentação
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default MovimentarEstoqueModal;