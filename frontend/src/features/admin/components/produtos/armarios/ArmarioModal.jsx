import * as React from "react";

import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import InputMoeda from "../../../../../components/ui/InputMoeda";
import Modal from "../../../../../components/ui/Modal";
import {
  bloquearTeclasNaoInteiras,
  validarQuantidadeInteira,
} from "../../../../../utils/formHelpers";

const ArmarioModalForm = ({
  armario = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  const emEdicao = Boolean(armario);

  const [preco, setPreco] = React.useState(() => Number(armario?.preco ?? 0));
  const [quantidade, setQuantidade] = React.useState(() =>
    armario ? String(armario.quantidade) : "",
  );
  const [erros, setErros] = React.useState({});

  const limparErro = (campo) => {
    setErros((prev) => (prev[campo] ? { ...prev, [campo]: "" } : prev));
  };

  const validarArmarioForm = () => {
    const novosErros = {};
    const precoNumero = Number(preco);

    if (!Number.isFinite(precoNumero) || precoNumero <= 0) {
      novosErros.preco = "Insira o preço.";
    } else if (precoNumero > 999.99) {
      novosErros.preco = "O preço máximo permitido é R$ 999,99.";
    }

    const erroQuantidade = validarQuantidadeInteira(quantidade, {
      mensagemVazio: "Insira a quantidade disponível.",
      mensagemMinimo: "A quantidade deve ser maior ou igual a 0.",
    });
    if (erroQuantidade) novosErros.quantidade = erroQuantidade;

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();

    if (!validarArmarioForm()) return;

    onSalvar({
      preco: Number(preco),
      quantidade: Number(quantidade),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {!emEdicao && (
        <p className="text-sm text-text-secondary">
          Informe o preço e a quantidade inicial para os armários.
        </p>
      )}

      <InputMoeda
        label="Preço"
        valor={preco}
        placeholder="00,00"
        onChange={(valor) => {
          setPreco(valor);
          limparErro("preco");
        }}
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
        placeholder="Ex.: 50"
        onKeyDown={bloquearTeclasNaoInteiras}
        value={quantidade}
        onChange={(evento) => {
          setQuantidade(evento.target.value);
          limparErro("quantidade");
        }}
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
          {emEdicao ? "Salvar alterações" : "Salvar configuração"}
        </Button>
      </footer>
    </form>
  );
};

const ArmarioModal = ({
  aberto,
  armario = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={
        armario ? "Editar configuração do armário" : "Configurar armário"
      }
      largura="max-w-lg"
    >
      {aberto && (
        <ArmarioModalForm
          key={armario ? `edit-${armario.id}` : "new"}
          armario={armario}
          onFechar={onFechar}
          onSalvar={onSalvar}
          salvando={salvando}
        />
      )}
    </Modal>
  );
};

export default ArmarioModal;
