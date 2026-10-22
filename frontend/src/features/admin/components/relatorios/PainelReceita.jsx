import * as React from "react";
import * as FiIcons from "react-icons/fi";
import { formatarMoeda } from "../../../../utils/formatters";

const PainelReceita = ({ resumoReceita = null, carregando = false }) => {
  const totais = resumoReceita?.totais ?? {
    totalArrecadado: 0,
    totalVendas: 0,
    ticketMedio: 0,
  };

  const categorias = resumoReceita?.porCategoria ?? {
    uniformes: { valor: 0, quantidade: 0, porcentagem: 0 },
    armarios: { valor: 0, quantidade: 0, porcentagem: 0 },
    contribuicao: { valor: 0, quantidade: 0, porcentagem: 0 },
  };

  const pagamentos = resumoReceita?.porPagamento ?? {
    dinheiro: 0,
    pix: 0,
    debito: 0,
    credito: 0,
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4 lg:border-r lg:border-border lg:pr-6">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-semibold uppercase tracking-wider">
            <FiIcons.FiTrendingUp size={15} className="text-primary" />
            <span>Balanço do Período</span>
          </div>

          <div className="mt-2">
            <p className="text-3xl font-extrabold tracking-tight text-text-primary">
              {carregando ? "..." : formatarMoeda(totais.totalArrecadado)}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1 font-medium text-text-primary">
              <FiIcons.FiShoppingBag size={13} className="text-text-secondary" />
              {totais.totalVendas} {totais.totalVendas === 1 ? "venda" : "vendas"}
            </span>
            <span>•</span>
            <span>
              Ticket médio:{" "}
              <strong className="font-semibold text-text-primary">
                {formatarMoeda(totais.ticketMedio)}
              </strong>
            </span>
          </div>
        </div>
        <div className="lg:col-span-4 lg:border-r lg:border-border lg:px-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Origem das Entradas
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="truncate font-medium">Uniformes</span>
              </div>
              <p className="mt-0.5 font-bold text-text-primary truncate">
                {formatarMoeda(categorias.uniformes.valor)}
              </p>
              <p className="text-[11px] text-text-secondary">
                {categorias.uniformes.quantidade} {categorias.uniformes.quantidade === 1 ? "peça" : "peças"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate font-medium">Armários</span>
              </div>
              <p className="mt-0.5 font-bold text-text-primary truncate">
                {formatarMoeda(categorias.armarios.valor)}
              </p>
              <p className="text-[11px] text-text-secondary">
                {categorias.armarios.quantidade} {categorias.armarios.quantidade === 1 ? "unidade" : "unidades"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate font-medium">Doação APM</span>
              </div>
              <p className="mt-0.5 font-bold text-text-primary truncate">
                {formatarMoeda(categorias.contribuicao.valor)}
              </p>
              <p className="text-[11px] text-text-secondary">
                {categorias.contribuicao.quantidade} {categorias.contribuicao.quantidade === 1 ? "doação" : "doações"}
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 lg:pl-6 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Conferência por Pagamento
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-surface-muted/60 p-2 border border-border/40">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium">Dinheiro</span>
              </div>
              <p className="mt-0.5 font-bold text-text-primary">
                {formatarMoeda(pagamentos.dinheiro)}
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted/60 p-2 border border-border/40">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="font-medium">Pix</span>
              </div>
              <p className="mt-0.5 font-bold text-text-primary">
                {formatarMoeda(pagamentos.pix)}
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted/60 p-2 border border-border/40">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                <span className="font-medium">Débito</span>
              </div>
              <p className="mt-0.5 font-bold text-text-primary">
                {formatarMoeda(pagamentos.debito)}
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted/60 p-2 border border-border/40">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                <span className="font-medium">Crédito</span>
              </div>
              <p className="mt-0.5 font-bold text-text-primary">
                {formatarMoeda(pagamentos.credito)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainelReceita;
