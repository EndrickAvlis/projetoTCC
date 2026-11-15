import * as React from "react";

import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import InputMoeda from "../../../../../components/ui/InputMoeda";
import Modal from "../../../../../components/ui/Modal";
import {
  bloquearTeclasNaoInteiras,
  validarQuantidadeInteira,
} from "../../../../../utils/formHelpers";

const UniformeModalForm = ({
  uniforme = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  const emEdicao = Boolean(uniforme);

  const [nome, setNome] = React.useState(() => uniforme?.nome ?? "");
  const [preco, setPreco] = React.useState(() => Number(uniforme?.preco ?? 0));
  const [quantidade, setQuantidade] = React.useState("");
  const [erros, setErros] = React.useState({});

  const limparErro = (campo) => {
    setErros((prev) => (prev[campo] ? { ...prev, [campo]: "" } : prev));
  };

  const validarUniformeForm = () => {
    const novosErros = {};
    const nomeLimpo = nome.trim();
    const precoNumero = Number(preco);

    if (!nomeLimpo) {
      novosErros.nome = "Insira um tamanho.";
    } else if (nomeLimpo.length > 50) {
      novosErros.nome = "O tamanho deve ter no máximo 50 caracteres.";
    }

    if (!Number.isFinite(precoNumero) || precoNumero <= 0) {
      novosErros.preco = "Insira o preço.";
    } else if (precoNumero > 999.99) {
      novosErros.preco = "O preço máximo permitido é R$ 999,99.";
    }

    if (!emEdicao) {
      const erroQuantidade = validarQuantidadeInteira(quantidade, {
        mensagemVazio: "Insira a quantidade inicial.",
        mensagemMinimo: "A quantidade inicial deve ser maior ou igual a 0.",
      });
      if (erroQuantidade) novosErros.quantidade = erroQuantidade;
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();

    if (!validarUniformeForm()) return;

    const payload = {
      nome: nome.trim(),
      preco: Number(preco),
    };

    if (!emEdicao) {
      payload.quantidade = Number(quantidade);
    }

    onSalvar(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="Tamanho"
        maxLength={50}
        value={nome}
        onChange={(evento) => {
          setNome(evento.target.value.toUpperCase());
          limparErro("nome");
        }}
        placeholder="Ex.: GG"
        error={erros.nome}
        disabled={salvando}
        required
        autoFocus
      />

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
      />

      {!emEdicao && (
        <Input
          label="Quantidade inicial"
          type="number"
          min="0"
          step="1"
          placeholder="Ex.: 20"
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
      )}

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
          {emEdicao ? "Salvar alterações" : "Adicionar uniforme"}
        </Button>
      </footer>
    </form>
  );
};

const UniformeModal = ({
  aberto,
  uniforme = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={uniforme ? "Editar uniforme" : "Adicionar uniforme"}
      largura="max-w-lg"
    >
      {aberto && (
        <UniformeModalForm
          key={uniforme ? `edit-${uniforme.id}` : "new"}
          uniforme={uniforme}
          onFechar={onFechar}
          onSalvar={onSalvar}
          salvando={salvando}
        />
      )}
    </Modal>
  );
};

export default UniformeModal;
