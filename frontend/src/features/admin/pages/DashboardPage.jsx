import * as React from "react";
import Input from "../../../components/ui/Input";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import TableFiltro from "../../../components/ui/TableFiltro";
import { formatarMoeda } from "../../../utils/formatters";
import { useDashboard } from "../hooks/useDashboard";

const OPCOES_PERIODO = [
  { valor: "todo", label: "Todo o período" },
  { valor: "hoje", label: "Hoje" },
  { valor: "semana", label: "Esta semana" },
  { valor: "mes", label: "Este mês" },
  { valor: "personalizado", label: "Personalizado" },
];

const DashboardPage = () => {
  const [periodo, setPeriodo] = React.useState("todo");
  const [dataInicio, setDataInicio] = React.useState("");
  const [dataFim, setDataFim] = React.useState("");

  const { totais, categorias, produtos, cursos } = useDashboard({
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
      <div className="flex flex-wrap items-center gap-3">
        <TableFiltro
          options={OPCOES_PERIODO}
          value={periodo}
          onChange={setPeriodo}
          ariaLabel="Filtro de período"
        />

        {periodo === "personalizado" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              size="sm"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              ariaLabel="Data de início"
            />
            <span className="text-sm text-text-secondary">até</span>
            <Input
              type="date"
              size="sm"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              ariaLabel="Data de fim"
            />
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 lg:p-8 text-text-inverse shadow-sm flex flex-col justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/4" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full bg-white/4" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <span className="block text-sm font-medium text-white/80">
              Total arrecadado no período
            </span>
            <p className="text-4xl font-extrabold text-white tracking-tight tabular-nums sm:text-5xl">
              {formatarMoeda(totais.arrecadado)}
            </p>
            <span className="block text-xs text-white/70">
              Produtos e contribuições recebidos
            </span>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-left sm:text-right">
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              {totais.vendas}{" "}
              {totais.vendas === 1
                ? "venda realizada"
                : "vendas realizadas"}
            </span>
            <span className="text-xs text-white/70">
              no período selecionado
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cardsKpis.map((card) => (
          <Card
            key={card.id}
            bordaLateral={card.borda}
            className="w-full bg-surface"
          >
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {card.titulo}
            </span>
            <div className="mt-2 text-2xl font-extrabold text-text-primary tabular-nums">
              {formatarMoeda(card.valor)}
            </div>
            <p className="mt-1 text-xs text-text-secondary font-medium">
              {card.quantidade} {card.rotulo}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          titulo="Produtos Mais Vendidos"
          subtitulo="Itens com maior saída"
          acoes={
            <Badge variant="neutral" size="sm">
              Top {produtos.length}
            </Badge>
          }
          divisor
          semPadding
        >
          <div className="divide-y divide-border">
            {produtos.length === 0 ? (
              <p className="py-8 text-center text-xs italic text-text-secondary">
                Nenhum produto registrado no período.
              </p>
            ) : (
              produtos.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3 text-xs hover:bg-surface-muted/40 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-bold text-text-secondary">
                      {idx + 1}
                    </span>
                    <span className="truncate font-semibold text-text-primary">
                      {item.nome}
                    </span>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-4">
                    <span className="w-16 text-right tabular-nums text-text-secondary">
                      {item.quantidade} un
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

        <Card
          titulo="Vendas por Curso"
          subtitulo="Volume por curso"
          acoes={
            <Badge variant="neutral" size="sm">
              {cursos.length} cursos
            </Badge>
          }
          divisor
          semPadding
        >
          <div className="divide-y divide-border">
            {cursos.length === 0 ? (
              <p className="py-8 text-center text-xs italic text-text-secondary">
                Nenhuma venda por curso registrada no período.
              </p>
            ) : (
              cursos.map((curso, idx) => (
                <div
                  key={curso.id}
                  className="flex items-center justify-between px-5 py-3 text-xs hover:bg-surface-muted/40 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-bold text-text-secondary">
                      {idx + 1}
                    </span>
                    <span className="truncate font-semibold text-text-primary">
                      {curso.nome}
                    </span>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-4">
                    <span className="w-16 text-right tabular-nums text-text-secondary">
                      {curso.quantidade}{" "}
                      {curso.quantidade === 1 ? "item" : "itens"}
                    </span>
                    <span className="w-24 text-right font-bold text-text-primary tabular-nums">
                      {formatarMoeda(curso.total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
