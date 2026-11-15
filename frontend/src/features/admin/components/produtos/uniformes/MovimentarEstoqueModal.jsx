import * as React from "react";
import { FiEdit3, FiPlus, FiMinus, FiAlertCircle } from "react-icons/fi";

import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Modal from "../../../../../components/ui/Modal";
import { formatarMoeda } from "../../../../../utils/formatters";
import {
  bloquearTeclasNaoInteiras,
  validarQuantidadeInteira,
} from "../../../../../utils/formHelpers";

const ESTOQUE_MAXIMO = 99999;

const OPERACOES_ESTOQUE = [
  {
    value: "adicionar",
    label: "Adicionar",
    icon: FiPlus,
    inputLabel: "Quantidade a adicionar",
    placeholder: "Ex.: 5",
    min: "1",
    botaoLabel: "Adicionar ao estoque",
    botaoVariant: "primary",
  },
  {
    value: "diminuir",
    label: "Diminuir",
    icon: FiMinus,
    inputLabel: "Quantidade a retirar",
    placeholder: "Ex.: 5",
    min: "1",
    botaoLabel: "Confirmar retirada",
    botaoVariant: "danger",
  },
  {
    value: "corrigir",
    label: "Corrigir",
    icon: FiEdit3,
    inputLabel: "Novo saldo total",
    placeholder: "Ex.: 20",
    min: "0",
    botaoLabel: "Atualizar estoque total",
    botaoVariant: "primary",
  },
];

const calcularNovoEstoque = (operacao, estoqueAtual, quantidadeTexto) => {
  if (quantidadeTexto.trim() === "") return null;

  const quantidade = Number(quantidadeTexto);
  if (!Number.isInteger(quantidade) || quantidade < 0) return NaN;

  if (operacao === "adicionar") return estoqueAtual + quantidade;
  if (operacao === "diminuir") return estoqueAtual - quantidade;
  return quantidade;
};

const MovimentarEstoqueModalForm = ({
  uniforme,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  const estoqueAtual = Number(uniforme.quantidade ?? 0);

  const [operacao, setOperacao] = React.useState("adicionar");
  const [quantidade, setQuantidade] = React.useState("");
  const [erros, setErros] = React.useState({});

  const alternarOperacao = (novaOperacao) => {
    setOperacao(novaOperacao);
    setErros({});
    setQuantidade(novaOperacao === "corrigir" ? String(estoqueAtual) : "");
  };

  const obterErroQuantidade = () => {
    if (operacao === "corrigir") {
      return validarQuantidadeInteira(quantidade, {
        mensagemVazio: "Informe a quantidade.",
        mensagemMinimo: "O novo estoque deve ser maior ou igual a 0.",
      });
    }

    if (operacao === "adicionar") {
      return validarQuantidadeInteira(quantidade, {
        mensagemVazio: "Informe a quantidade.",
        minimo: 1,
        mensagemMinimo: "Informe uma quantidade maior que 0.",
        maximo: ESTOQUE_MAXIMO - estoqueAtual,
        mensagemMaximo: `O estoque final não pode exceder ${ESTOQUE_MAXIMO.toLocaleString("pt-BR")} unidades.`,
      });
    }

    return validarQuantidadeInteira(quantidade, {
      mensagemVazio: "Informe a quantidade.",
      minimo: 1,
      mensagemMinimo: "Informe uma quantidade maior que 0.",
      maximo: estoqueAtual,
      mensagemMaximo: `A quantidade a retirar não pode exceder o estoque atual (${estoqueAtual}).`,
    });
  };

  const validarFormulario = () => {
    const erroQuantidade = obterErroQuantidade();
    setErros(erroQuantidade ? { quantidade: erroQuantidade } : {});
    return !erroQuantidade;
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) return;

    onSalvar({
      operacao,
      quantidade: Number(quantidade),
    });
  };

  const novoEstoque = calcularNovoEstoque(operacao, estoqueAtual, quantidade);
  const operacaoAtual = OPERACOES_ESTOQUE.find((item) => item.value === operacao);
  const BotaoIcone = operacaoAtual.icon;

  const renderPreviaEstoque = () => {
    if (erros.quantidade || novoEstoque === null) return null;

    if (Number.isNaN(novoEstoque)) {
      return (
        <p className="text-xs text-status-danger">
          Informe uma quantidade inteira válida.
        </p>
      );
    }

    if (operacao !== "corrigir" && Number(quantidade) === 0) {
      return (
        <p className="text-xs text-status-danger">
          Informe uma quantidade maior que 0.
        </p>
      );
    }

    if (novoEstoque < 0) {
      return (
        <p className="text-xs text-status-danger">
          A retirada excede o estoque atual ({estoqueAtual}).
        </p>
      );
    }

    if (novoEstoque > ESTOQUE_MAXIMO) {
      return (
        <p className="text-xs text-status-danger">
          O estoque final não pode exceder 99.999 unidades.
        </p>
      );
    }

    const ajusteTexto =
      operacao === "adicionar"
        ? ` (+${quantidade})`
        : operacao === "diminuir"
          ? ` (-${quantidade})`
          : "";

    if (novoEstoque === 0) {
      return (
        <p className="flex items-center gap-1.5 text-xs text-status-warning">
          <FiAlertCircle size={14} className="shrink-0" />
          <span>
            Novo estoque: 0 unidades{ajusteTexto} — atenção: o estoque ficará
            zerado.
          </span>
        </p>
      );
    }

    return (
      <p className="text-xs text-text-secondary">
        Novo estoque:{" "}
        <strong className="font-semibold text-text-primary">
          {novoEstoque} {novoEstoque === 1 ? "unidade" : "unidades"}
        </strong>
        {ajusteTexto}
      </p>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="font-semibold text-text-primary">
            Tamanho {uniforme.nome}
          </p>
          <p className="text-sm text-text-secondary">
            {formatarMoeda(Number(uniforme.preco ?? 0))}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-text-secondary">Estoque atual</span>
          <p className="text-lg font-bold text-text-primary">
            {estoqueAtual}{" "}
            <span className="text-xs font-normal text-text-secondary">
              {estoqueAtual === 1 ? "unidade" : "unidades"}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <span
          id="label-operacao-estoque"
          className="block text-sm font-medium text-primary"
        >
          Tipo de movimentação <span className="text-status-danger">*</span>
        </span>

        <div
          className="grid grid-cols-3 gap-1 rounded-btn border border-border bg-surface p-1"
          role="radiogroup"
          aria-labelledby="label-operacao-estoque"
        >
          {OPERACOES_ESTOQUE.map((opcao) => {
            const Icone = opcao.icon;
            const selecionada = operacao === opcao.value;
            const desabilitada =
              opcao.value === "diminuir" && estoqueAtual === 0;

            return (
              <button
                key={opcao.value}
                type="button"
                role="radio"
                aria-checked={selecionada}
                disabled={salvando || desabilitada}
                onClick={() => alternarOperacao(opcao.value)}
                className={`flex items-center justify-center gap-1.5 rounded-btn px-3 py-2 text-sm font-medium transition-colors ${
                  selecionada
                    ? "bg-primary text-text-inverse shadow-sm"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                } ${desabilitada ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
              >
                <Icone size={15} />
                <span>{opcao.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Input
          label={operacaoAtual.inputLabel}
          type="number"
          min={operacaoAtual.min}
          step="1"
          placeholder={operacaoAtual.placeholder}
          onKeyDown={bloquearTeclasNaoInteiras}
          value={quantidade}
          onChange={(evento) => {
            setQuantidade(evento.target.value);
            setErros({});
          }}
          error={erros.quantidade}
          disabled={salvando}
          required
          autoFocus
        />
        {renderPreviaEstoque()}
      </div>

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
          variant={operacaoAtual.botaoVariant}
          loading={salvando}
          leftIcon={<BotaoIcone />}
        >
          {operacaoAtual.botaoLabel}
        </Button>
      </footer>
    </form>
  );
};

const MovimentarEstoqueModal = ({
  aberto,
  uniforme = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  return (
    <Modal
      aberto={aberto && Boolean(uniforme)}
      onFechar={() => !salvando && onFechar()}
      titulo="Movimentar estoque"
      largura="max-w-lg"
    >
      {aberto && uniforme && (
        <MovimentarEstoqueModalForm
          key={`estoque-${uniforme.id}`}
          uniforme={uniforme}
          onFechar={onFechar}
          onSalvar={onSalvar}
          salvando={salvando}
        />
      )}
    </Modal>
  );
};

export default MovimentarEstoqueModal;
