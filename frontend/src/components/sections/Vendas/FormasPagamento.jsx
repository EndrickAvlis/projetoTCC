// Seleção das formas de pagamento e divisão do valor total entre elas.
import InputMoeda from "../../ui/InputMoeda";
import { formatarMoeda } from "../../../utils/formatters";

const nomePagamentos = { pix: "Pix", dinheiro: "Dinheiro", debito: "Débito", credito: "Crédito" };

const FormasPagamento = ({ formas, pagamentosSelecionados, valores, diferencaPagamento, onAlternarForma, onAlterarValor, disabled = false }) => (
  <section className="bg-surface border border-border rounded-lg p-5 space-y-5">
    <div>
      <h2 className="text-section font-semibold text-primary">Formas de pagamento</h2>
      <p className="text-sm text-text-secondary">Selecione uma ou mais formas e informe o valor de cada uma.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
      {formas.map((forma) => {
        const selecionada = pagamentosSelecionados.includes(forma);
        return <div key={forma} className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-text-primary cursor-pointer">
            <input type="checkbox" checked={selecionada} disabled={disabled} onChange={() => onAlternarForma(forma)} className="h-4 w-4 accent-primary" />
            {nomePagamentos[forma]}
          </label>
          {selecionada && <div className="flex items-center gap-2 max-w-70">
            <span className="text-sm text-text-secondary">R$</span>
            <InputMoeda aria-label={`Valor pago em ${nomePagamentos[forma]}`} placeholder="0,00" valor={valores[forma] || 0} disabled={disabled} size="sm" onChange={(valorTotal) => onAlterarValor(forma, valorTotal)} />
          </div>}
        </div>;
      })}
    </div>
    {diferencaPagamento > 0 && <p className="font-medium text-status-danger">Faltam {formatarMoeda(diferencaPagamento)}</p>}
    {diferencaPagamento < 0 && <p className="font-medium text-status-danger">Pagamento excede em {formatarMoeda(Math.abs(diferencaPagamento))}</p>}
    {diferencaPagamento === 0 && <p className="font-medium text-status-success">Pagamento completo.</p>}
  </section>
);

export default FormasPagamento;
