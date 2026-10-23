import * as React from "react";
import * as FiIcons from "react-icons/fi";
import { formatarMoeda } from "../../../../utils/formatters";

const CATALOGO = [
  {
    chave: "uniformes",
    label: "Uniformes",
    cor: "bg-primary",
    unidade: "peça",
    unidadePlural: "peças",
  },
  {
    chave: "armarios",
    label: "Armários",
    cor: "bg-emerald-500",
    unidade: "unidade",
    unidadePlural: "unidades",
  },
  {
    chave: "contribuicao",
    label: "Doação APM",
    cor: "bg-amber-500",
    unidade: "doação",
    unidadePlural: "doações",
  },
];

const FORMAS_PAGAMENTO = [
  { chave: "dinheiro", label: "Dinheiro", cor: "bg-emerald-500" },
  { chave: "pix", label: "Pix", cor: "bg-primary" },
  { chave: "debito", label: "Débito", cor: "bg-sky-500" },
  { chave: "credito", label: "Crédito", cor: "bg-violet-500" },
];

const PainelReceita = ({ resumoReceita, carregando = false }) => {
  const totais = resumoReceita?.totais || {
    totalArrecadado: 0,
    totalVendas: 0,
    ticketMedio: 0,
  };
  const categorias = resumoReceita?.porCategoria || {};
  const pagamentos = resumoReceita?.porPagamento || {};

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-xs">
      <div className="grid grid-cols-12 items-center gap-6">
        <div className="col-span-3 pr-6">
          <div className="mt-2">
            <p className="text-3xl font-extrabold tracking-tight text-text-primary">
              {carregando ? "..." : formatarMoeda(totais.totalArrecadado)}
            </p>
          </div>
          <div className="mt-3 flex flex-col items-start gap-1 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-text-primary">
              {totais.totalVendas}{" "}
              {totais.totalVendas === 1 ? "venda" : "vendas"}
            </span>
            <span>
              Ticket médio:{" "}
              <strong className="font-semibold text-text-primary">
                {formatarMoeda(totais.ticketMedio)}
              </strong>
            </span>
          </div>
        </div>

        <div className="col-span-5 px-6">
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            {CATALOGO.map(({ chave, label, cor, unidade, unidadePlural }) => {
              const dados = categorias[chave];
              return (
                <div key={chave} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <span className={`h-2 w-2 rounded-full ${cor} shrink-0`} />
                    <span className="text-sm">{label}</span>
                  </div>
                  <p className="mt-0.5 font-bold text-sm text-text-primary">
                    {formatarMoeda(dados.valor)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {dados.quantidade}{" "}
                    {dados.quantidade === 1 ? unidade : unidadePlural}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-4 pl-6 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {FORMAS_PAGAMENTO.map(({ chave, label, cor }) => (
              <div
                key={chave}
                className="rounded-lg bg-surface-muted/60 p-2 border border-border/40"
              >
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <span className={`h-2 w-2 rounded-full ${cor} shrink-0`} />
                  <span className="font-medium">{label}</span>
                </div>
                <p className="mt-0.5 font-bold text-sm text-text-primary">
                  {formatarMoeda(pagamentos[chave] || 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainelReceita;
