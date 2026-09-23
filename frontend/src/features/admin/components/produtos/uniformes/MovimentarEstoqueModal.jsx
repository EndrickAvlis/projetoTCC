import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Modal from "../../../../../components/ui/Modal";
import { formatarMoeda } from "../../../../../utils/formatters";

const OPCOES_MOVIMENTACAO = [
  {
    value: "corrigir",
    label: "Corrigir",
    descricao: "Ajustar saldo total",
    icon: FiIcons.FiEdit3,
    activeColor: "bg-primary text-text-inverse shadow-sm",
  },
  {
    value: "adicionar",
    label: "Adicionar",
    descricao: "Entrada de estoque",
    icon: FiIcons.FiPlus,
    activeColor: "bg-status-success text-text-inverse shadow-sm",
  },
  {
    value: "diminuir",
    label: "Diminuir",
    descricao: "Retirada ou baixa",
    icon: FiIcons.FiMinus,
    activeColor: "bg-status-danger text-text-inverse shadow-sm",
  },
];

const MovimentarEstoqueModal = ({
  uniforme,
  onFechar,
  onSalvar,
  salvando = false,
  erro = null,
}) => {
  const [operacao, setOperacao] = React.useState("adicionar");
  const [quantidade, setQuantidade] = React.useState("");
  const [erros, setErros] = React.useState({});

  const estoqueAtual = Number(uniforme?.quantidade ?? 0);

  // Sincroniza o formulário ao abrir para um uniforme
  React.useEffect(() => {
    if (uniforme) {
      setOperacao("corrigir");
      setQuantidade("");
      setErros({});
    }
  }, [uniforme]);

  const alternarOperacao = (novaOperacao) => {
    setOperacao(novaOperacao);
    setErros({});

    // Se for corrigir, pré-preenche com o estoque atual para agilizar ajuste fino
    if (novaOperacao === "corrigir") {
      setQuantidade(String(estoqueAtual));
    } else {
      setQuantidade("");
    }
  };

  const validarFormulario = () => {
    const novosErros = {};
    const qtdNum = Number(quantidade);

    if (quantidade === "" || !Number.isInteger(qtdNum)) {
      novosErros.quantidade = "Informe uma quantidade inteira.";
    } else if (operacao === "corrigir" && qtdNum < 0) {
      novosErros.quantidade = "O novo estoque deve ser maior ou igual a zero.";
    } else if (operacao !== "corrigir" && qtdNum <= 0) {
      novosErros.quantidade = "Informe uma quantidade maior que zero.";
    } else if (operacao === "diminuir") {
      if (estoqueAtual === 0) {
        novosErros.quantidade = "Não há estoque disponível para retirada.";
      } else if (qtdNum > estoqueAtual) {
        novosErros.quantidade = `A quantidade a retirar não pode exceder o estoque atual (${estoqueAtual}).`;
      }
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
      operacao,
      quantidade: Number(quantidade),
    });
  };

  // Cálculo de pré-visualização em tempo real
  const qtdNumero = quantidade === "" ? null : Number(quantidade);
  const qtdValida =
    qtdNumero !== null && Number.isInteger(qtdNumero) && qtdNumero >= 0;

  let novoEstoque = null;
  let diferenca = null;

  if (qtdValida) {
    if (operacao === "adicionar") {
      novoEstoque = estoqueAtual + qtdNumero;
      diferenca = qtdNumero;
    } else if (operacao === "diminuir") {
      novoEstoque = estoqueAtual - qtdNumero;
      diferenca = -qtdNumero;
    } else if (operacao === "corrigir") {
      novoEstoque = qtdNumero;
      diferenca = qtdNumero - estoqueAtual;
    }
  }

  const estoqueZeradoAoDiminuir =
    operacao === "diminuir" &&
    qtdValida &&
    qtdNumero > 0 &&
    novoEstoque === 0;

  return (
    <Modal
      aberto={Boolean(uniforme)}
      onFechar={() => !salvando && onFechar()}
      titulo="Movimentar estoque"
      largura="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {erro && <Alert type="error" message={erro} />}

        {/* Card informativo do Uniforme */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted p-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
              {uniforme?.nome}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">
                  Tamanho {uniforme?.nome}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${uniforme?.status === "arquivado"
                      ? "bg-disabled-bg text-text-secondary"
                      : "bg-status-success-bg text-status-success"
                    }`}
                >
                  {uniforme?.status === "arquivado" ? "Arquivado" : "Ativo"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">
                Preço unitário: {formatarMoeda(Number(uniforme?.preco ?? 0))}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-text-secondary">Estoque atual</span>
            <p className="text-xl font-bold text-text-primary">
              {estoqueAtual}{" "}
              <span className="text-xs font-normal text-text-secondary">
                {estoqueAtual === 1 ? "unidade" : "unidades"}
              </span>
            </p>
          </div>
        </div>

        {/* Seletor Segmentado de Operação */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-primary">
            Tipo de movimentação <span className="text-status-danger">*</span>
          </label>

          <div
            className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface p-1.5"
            role="radiogroup"
            aria-label="Operação de estoque"
          >
            {OPCOES_MOVIMENTACAO.map((opcao) => {
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
                  className={`flex flex-col items-center justify-center gap-1 rounded-lg px-2.5 py-2.5 text-xs font-medium transition-all ${selecionada
                      ? opcao.activeColor
                      : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    } ${desabilitada ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <Icone size={15} />
                    <span>{opcao.label}</span>
                  </div>
                  <span className="text-[11px] font-normal opacity-85">
                    {opcao.descricao}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerta contextual se o estoque atual for 0 ao tentar diminuir */}
        {operacao === "diminuir" && estoqueAtual === 0 && (
          <Alert
            type="warning"
            message="Este tamanho já não possui itens em estoque para retirada."
          />
        )}

        {/* Campo de Entrada de Quantidade */}
        <Input
          label={
            operacao === "corrigir"
              ? "Novo saldo total"
              : operacao === "adicionar"
                ? "Quantidade a adicionar"
                : "Quantidade a retirar"
          }
          type="number"
          min={operacao === "corrigir" ? "0" : "1"}
          step="1"
          placeholder={
            operacao === "corrigir"
              ? "Ex.: 20"
              : "Ex.: 5"
          }
          value={quantidade}
          onChange={(evento) => {
            setQuantidade(evento.target.value);
            setErros({});
          }}
          error={erros.quantidade}
          disabled={salvando || (operacao === "diminuir" && estoqueAtual === 0)}
          required
          autoFocus
        />

        {/* Simulação / Preview do Estoque Resultante */}
        {qtdValida && (
          <div className="space-y-2.5 rounded-xl border border-border bg-surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Simulação do estoque
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-text-secondary">Saldo atual</span>
                <span className="text-base font-semibold text-text-primary">
                  {estoqueAtual} unid.
                </span>
              </div>

              <FiIcons.FiArrowRight className="text-text-secondary" />

              <div className="flex flex-col items-center">
                <span className="text-xs text-text-secondary">Ajuste</span>
                <span
                  className={`text-base font-bold ${diferenca > 0
                      ? "text-status-success"
                      : diferenca < 0
                        ? "text-status-danger"
                        : "text-text-secondary"
                    }`}
                >
                  {diferenca > 0
                    ? `+${diferenca}`
                    : diferenca === 0
                      ? "0"
                      : `${diferenca}`}
                </span>
              </div>

              <FiIcons.FiArrowRight className="text-text-secondary" />

              <div className="flex flex-col items-end">
                <span className="text-xs text-text-secondary">Novo saldo</span>
                <span
                  className={`text-base font-bold ${novoEstoque < 0
                      ? "text-status-danger"
                      : novoEstoque === 0
                        ? "text-status-warning"
                        : "text-status-success"
                    }`}
                >
                  {novoEstoque < 0
                    ? "Inválido"
                    : `${novoEstoque} ${novoEstoque === 1 ? "unidade" : "unidades"
                    }`}
                </span>
              </div>
            </div>

            {estoqueZeradoAoDiminuir && (
              <div className="flex items-center gap-1.5 border-t border-border/60 pt-2 text-xs text-status-warning">
                <FiIcons.FiAlertCircle size={14} className="shrink-0" />
                <span>
                  Atenção: esta baixa deixará o estoque deste uniforme totalmente zerado.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Rodapé com botões de ação */}
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
            variant={
              operacao === "diminuir"
                ? "danger"
                : "primary"
            }
            loading={salvando}
            disabled={operacao === "diminuir" && estoqueAtual === 0}
            leftIcon={
              operacao === "adicionar" ? (
                <FiIcons.FiPlus />
              ) : operacao === "diminuir" ? (
                <FiIcons.FiMinus />
              ) : (
                ""
              )
            }
          >
            {operacao === "adicionar"
              ? "Adicionar ao estoque"
              : operacao === "diminuir"
                ? "Confirmar retirada"
                : "Atualizar estoque total"}
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default MovimentarEstoqueModal;