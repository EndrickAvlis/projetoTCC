import * as React from "react";
import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import FiltroPeriodo from "../../../components/ui/FiltroPeriodo";
import { formatarMoeda } from "../../../utils/formatters";
import { useDashboard } from "../hooks/useDashboard";

const CardRanking = ({
  titulo,
  badgeTexto,
  itens,
  mensagemVazia,
  formatarQuantidade,
}) => (
  <Card
    titulo={titulo}
    acoes={
      <Badge variant="neutral" size="sm">
        {badgeTexto}
      </Badge>
    }
    divisor
    semPadding
    className="flex flex-col"
  >
    <div className="max-h-72 flex-1 divide-y divide-border overflow-y-auto">
      {itens.length === 0 ? (
        <p className="py-10 text-center text-xs italic text-text-secondary">
          {mensagemVazia}
        </p>
      ) : (
        itens.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-5 py-3 text-xs transition-colors hover:bg-surface-muted/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-bold text-text-secondary tabular-nums">
                {idx + 1}
              </span>
              <span
                className="truncate font-semibold text-text-primary"
                title={item.nome}
              >
                {item.nome}
              </span>
            </div>
            <div className="ml-4 flex shrink-0 items-center gap-4">
              <span className="w-20 text-right tabular-nums text-text-secondary">
                {formatarQuantidade(item.quantidade)}
              </span>
              <span className="w-24 text-right font-bold text-text-primary tabular-nums">
                {formatarMoeda(item.total)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </Card>
);

const DashboardPage = () => {
  const [periodo, setPeriodo] = React.useState("TODO");
  const [dataInicio, setDataInicio] = React.useState("");
  const [dataFim, setDataFim] = React.useState("");

  const { totais, categorias, produtos, cursos, carregando, erro } =
    useDashboard({
      periodo,
      dataInicio,
      dataFim,
    });

  const cardsKpis = [
    {
      id: "uniformes",
      titulo: "Uniformes",
      valor: categorias.uniformes.valor,
      quantidade: categorias.uniformes.quantidade,
      rotulo:
        categorias.uniformes.quantidade === 1
          ? "peça vendida"
          : "peças vendidas",
      borda: "primary",
    },
    {
      id: "armarios",
      titulo: "Armários",
      valor: categorias.armarios.valor,
      quantidade: categorias.armarios.quantidade,
      rotulo:
        categorias.armarios.quantidade === 1
          ? "locação realizada"
          : "locações realizadas",
      borda: "success",
    },
    {
      id: "contribuicao",
      titulo: "Contribuição APM",
      valor: categorias.contribuicao.valor,
      quantidade: categorias.contribuicao.quantidade,
      rotulo:
        categorias.contribuicao.quantidade === 1
          ? "doação recebida"
          : "doações recebidas",
      borda: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FiltroPeriodo
          periodo={periodo}
          dataInicio={dataInicio}
          dataFim={dataFim}
          onPeriodoChange={setPeriodo}
          onDataInicioChange={setDataInicio}
          onDataFimChange={setDataFim}
        />

        {carregando && (
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Atualizando...</span>
          </div>
        )}
      </div>

      {erro && <Alert type="error" message={erro} />}

      <div
        aria-busy={carregando}
        className={`space-y-6 transition-opacity duration-150 ${
          carregando ? "opacity-60" : "opacity-100"
        }`}
      >
        <section className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-primary p-6 text-text-inverse shadow-sm lg:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-surface/5" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full bg-surface/5" />

          <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <span className="block text-sm font-medium text-primary-text-muted">
                Total arrecadado no período
              </span>
              <p className="text-4xl font-extrabold tracking-tight text-text-inverse tabular-nums sm:text-5xl">
                {formatarMoeda(totais.arrecadado)}
              </p>
              <span className="block text-xs text-primary-text-muted/80">
                Uniformes, armários e contribuições recebidas
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-left sm:items-end sm:text-right">
              <span className="inline-flex items-center rounded-full border border-primary-border/30 bg-admin-sidebar-active px-3 py-1 text-xs font-semibold text-text-inverse">
                {totais.vendas}{" "}
                {totais.vendas === 1 ? "venda realizada" : "vendas realizadas"}
              </span>
              <span className="text-xs text-primary-text-muted/80">
                no período selecionado
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cardsKpis.map((card) => (
            <Card
              key={card.id}
              bordaLateral={card.borda}
              className="w-full bg-surface"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {card.titulo}
              </span>
              <div className="mt-2 text-2xl font-extrabold text-text-primary tabular-nums">
                {formatarMoeda(card.valor)}
              </div>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {card.quantidade} {card.rotulo}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <CardRanking
            titulo="Uniformes Mais Vendidos"
            badgeTexto={`${produtos.length} ${
              produtos.length === 1 ? "uniforme" : "uniformes"
            }`}
            itens={produtos}
            mensagemVazia="Nenhum uniforme vendido no período."
            formatarQuantidade={(qtd) => `${qtd} un`}
          />

          <CardRanking
            titulo="Vendas por Curso"
            badgeTexto={`${cursos.length} ${
              cursos.length === 1 ? "curso" : "cursos"
            }`}
            itens={cursos}
            mensagemVazia="Nenhuma venda por curso registrada no período."
            formatarQuantidade={(qtd) =>
              `${qtd} ${qtd === 1 ? "venda" : "vendas"}`
            }
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
