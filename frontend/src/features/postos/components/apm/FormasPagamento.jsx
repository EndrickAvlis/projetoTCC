import { FiPlus, FiX } from "react-icons/fi";
import InputMoeda from "../../../../components/ui/InputMoeda";
import { formatarMoeda } from "../../../../utils/formatters";

const NOMES_FORMAS = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  debito: "Débito",
  credito: "Crédito",
};

const FormasPagamento = ({
  formas = ["pix", "dinheiro", "debito", "credito"],
  pagamentosSelecionados = [],
  valores = {},
  totalCompra = 0,
  diferencaPagamento = 0,
  onAlternarForma,
  onAlterarValor,
  disabled = false,
}) => {
  const semValor = totalCompra <= 0;
  const desabilitadoGeral = disabled || semValor;
  return (
    <div className="flex flex-col gap-3 pb-7">
      <div>
        <h4 className="text-xs uppercase tracking-wider text-text-primary font-bold">
          Formas de Pagamento
        </h4>
      </div>

      <div className="flex flex-col gap-2">
        {formas.map((forma) => {
          const selecionada = pagamentosSelecionados.includes(forma);
          return (
            <div
              key={forma}
              onClick={() => {
                if (!desabilitadoGeral && !selecionada) {
                  onAlternarForma(forma);
                }
              }}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 transition-all ${
                desabilitadoGeral
                  ? "cursor-not-allowed opacity-50 bg-page border-border"
                  : selecionada
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-2xs"
                    : "cursor-pointer border-border bg-page hover:border-primary/40 hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full transition-colors ${
                    selecionada ? "bg-primary" : "bg-border-strong"
                  }`}
                />
                <span className="text-xs font-bold text-text-primary">
                  {NOMES_FORMAS[forma] || forma}
                </span>
              </div>

              {selecionada ? (
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-28">
                    <InputMoeda
                      aria-label={`Valor pago em ${NOMES_FORMAS[forma]}`}
                      placeholder="0,00"
                      valor={valores[forma] || 0}
                      onChange={(val) => onAlterarValor(forma, val)}
                      disabled={desabilitadoGeral}
                      size="sm"
                      inputClassName="text-right py-1 text-base h-7"
                    />
                  </div>
                  <button
                    type="button"
                    title={`Remover ${NOMES_FORMAS[forma] || forma}`}
                    aria-label={`Remover ${NOMES_FORMAS[forma] || forma}`}
                    disabled={desabilitadoGeral}
                    onClick={() => onAlternarForma(forma)}
                    className="p-1 text-text-secondary hover:text-status-danger transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FiX className="text-sm" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={desabilitadoGeral}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!desabilitadoGeral) onAlternarForma(forma);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-primary transition-colors cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded hover:bg-primary/5"
                >
                  <FiPlus className="text-xs" />
                  <span>Adicionar</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-1 text-xs">
        {semValor ? (
          <p className="text-text-secondary">
            Adicione itens ao carrinho para registrar o pagamento.
          </p>
        ) : diferencaPagamento > 0 ? (
          <p className="font-bold text-status-danger">
            Faltam {formatarMoeda(diferencaPagamento)} para bater o total.
          </p>
        ) : diferencaPagamento < 0 ? (
          <p className="font-bold text-status-warning">
            Excede em {formatarMoeda(Math.abs(diferencaPagamento))}.
          </p>
        ) : (
          <p className="font-bold text-status-success">
            Pagamento total atingido.
          </p>
        )}
      </div>
    </div>
  );
};

export default FormasPagamento;