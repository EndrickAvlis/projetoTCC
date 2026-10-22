import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import TableFiltro from "../../../components/ui/TableFiltro";
import PainelReceita from "../components/relatorios/PainelReceita";
import VendaDetalhesModal from "../components/relatorios/VendaDetalhesModal";
import { useCursos } from "../hooks/useCursos";
import { useUsuarios } from "../hooks/useUsuarios";
import { exportarRelatorio } from "../services/relatorioService";
import { formatarMoeda, formatarHora } from "../../../utils/formatters";

const OPCOES_PERIODO = [
  { valor: "HOJE", label: "Hoje" },
  { valor: "SEMANA", label: "Esta semana" },
  { valor: "MES", label: "Este mês" },
  { valor: "PERSONALIZADO", label: "Personalizado" },
];

const OPCOES_FORMA_PAGAMENTO = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "debito", label: "Cartão de Débito" },
  { value: "credito", label: "Cartão de Crédito" },
];

const OPCOES_TIPO_RECEITA = [
  { value: "uniforme", label: "Uniformes" },
  { value: "armario", label: "Armários" },
  { value: "contribuicao", label: "Contribuição APM" },
];

const FILTROS_INICIAIS = {
  periodo: "HOJE",
  dataInicio: "",
  dataFim: "",
  cursoId: "",
  formaPagamento: "",
  tipoReceita: "",
  atendenteId: "",
};

const RelatoriosPage = () => {
  const [filtros, setFiltros] = React.useState(FILTROS_INICIAIS);
  const [pagina, setPagina] = React.useState(1);
  const [totalVendas, setTotalVendas] = React.useState(0);
  const [vendas, setVendas] = React.useState([]);
  const [carregandoVendas, setCarregandoVendas] = React.useState(false);
  const [exportando, setExportando] = React.useState(false);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [carregandoDetalhes, setCarregandoDetalhes] = React.useState(false);
  const [vendaSelecionada, setVendaSelecionada] = React.useState(null);

  const handleAbrirDetalhes = async (idVenda) => {
    setModalAberto(true);
    setCarregandoDetalhes(true);
    setVendaSelecionada(null);
    setCarregandoDetalhes(false);
  };

  const [resumoReceita, setResumoReceita] = React.useState({
    totais: { totalArrecadado: 0, totalVendas: 0, ticketMedio: 0 },
    porCategoria: {
      uniformes: { valor: 0, quantidade: 0, porcentagem: 0 },
      armarios: { valor: 0, quantidade: 0, porcentagem: 0 },
      contribuicao: { valor: 0, quantidade: 0, porcentagem: 0 },
    },
    porPagamento: { dinheiro: 0, pix: 0, debito: 0, credito: 0 },
  });

  const { cursos } = useCursos();
  const { usuarios } = useUsuarios();

  const alterarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  };

  const colunasVendas = [
    {
      key: "dataHora",
      label: "Data / Hora",
      render: (venda) => (
        <span className="text-xs font-medium text-text-primary">
          {formatarHora(venda.dataHora)}
        </span>
      ),
    },
    {
      key: "aluno",
      label: "Aluno",
      render: (venda) => (
        <span className="font-semibold text-text-primary">
          {venda.aluno || "—"}
        </span>
      ),
    },
    {
      key: "quantidadeItens",
      label: "Qtd. Itens",
      render: (venda) => {
        const qtd = venda.quantidadeItens ?? 0;
        return (
          <span className="font-medium text-text-primary">
            {qtd} {qtd === 1 ? "item" : "itens"}
          </span>
        );
      },
    },
    {
      key: "precoTotal",
      label: "Valor Total",
      render: (venda) => (
        <span className="font-bold text-text-primary">
          {formatarMoeda(venda.precoTotal)}
        </span>
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (venda) => (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FiIcons.FiEye size={14} />}
          onClick={() => handleAbrirDetalhes(venda.id)}
        >
          Detalhes
        </Button>
      ),
    },
  ];

  const handleExportar = async () => {
    try {
      setExportando(true);
      const blob = await exportarRelatorio(filtros);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "text/csv;charset=utf-8;" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `extrato-vendas-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Falha tratada pelo interceptor global de notificações da API
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-end">
        <Button
          variant="primary"
          leftIcon={<FiIcons.FiDownload size={18} />}
          onClick={handleExportar}
          loading={exportando}
          disabled={exportando}
          className="w-full sm:w-auto"
        >
          {exportando ? "Exportando..." : "Exportar Relatório"}
        </Button>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <TableFiltro
              options={OPCOES_PERIODO}
              value={filtros.periodo}
              onChange={(valor) => alterarFiltro("periodo", valor)}
              ariaLabel="Filtro de período"
            />

            {filtros.periodo === "PERSONALIZADO" && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  size="sm"
                  value={filtros.dataInicio}
                  onChange={(e) => alterarFiltro("dataInicio", e.target.value)}
                  ariaLabel="Data de início"
                />
                <span className="text-sm text-text-secondary">até</span>
                <Input
                  type="date"
                  size="sm"
                  value={filtros.dataFim}
                  onChange={(e) => alterarFiltro("dataFim", e.target.value)}
                  ariaLabel="Data de fim"
                />
              </div>
            )}
          </div>

          <p className="text-sm text-text-secondary">
            {totalVendas} vendas encontradas
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="w-full lg:flex-[1.5] lg:min-w-60">
            <Select
              placeholder="Todos os cursos"
              value={filtros.cursoId}
              onChange={(e) => alterarFiltro("cursoId", e.target.value)}
              options={cursos.map((c) => ({
                value: String(c.id),
                label: c.nome,
              }))}
              size="md"
            />
          </div>

          <div className="w-full lg:flex-1 lg:min-w-42.5">
            <Select
              placeholder="Todas as formas"
              value={filtros.formaPagamento}
              onChange={(e) => alterarFiltro("formaPagamento", e.target.value)}
              options={OPCOES_FORMA_PAGAMENTO}
              size="md"
            />
          </div>

          <div className="w-full lg:flex-1 lg:min-w-42.5">
            <Select
              placeholder="Todas as entradas"
              value={filtros.tipoReceita}
              onChange={(e) => alterarFiltro("tipoReceita", e.target.value)}
              options={OPCOES_TIPO_RECEITA}
              size="md"
            />
          </div>

          <div className="w-full lg:flex-1 lg:min-w-42.5">
            <Select
              placeholder="Todos os atendentes"
              value={filtros.atendenteId}
              onChange={(e) => alterarFiltro("atendenteId", e.target.value)}
              options={usuarios.map((u) => ({
                value: String(u.id),
                label: u.nome,
              }))}
              size="md"
            />
          </div>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<FiIcons.FiRotateCcw size={15} />}
            onClick={() => setFiltros(FILTROS_INICIAIS)}
            className="w-full sm:w-auto shrink-0 px-3.5"
            title="Limpar filtros"
          >
            Limpar
          </Button>
        </div>
      </section>

      {/* 2. Painel de Receita Consolidada */}
      <PainelReceita resumoReceita={resumoReceita} carregando={false} />

      {/* 3. Extrato Analítico de Vendas */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Extrato de Vendas
            </h2>
            <p className="text-xs text-text-secondary">
              Listagem analítica das vendas registradas no período filtrado.
            </p>
          </div>
        </div>

        <DataTable
          columns={colunasVendas}
          data={vendas}
          getRowKey={(v) => v.id}
          pagina={pagina}
          limite={10}
          total={totalVendas}
          onPaginaChange={setPagina}
          emptyMessage={
            carregandoVendas
              ? "Carregando movimentações..."
              : "Nenhuma venda registrada para os filtros selecionados."
          }
        />
      </section>

      {/* 4. Modal de Comprovante de Venda */}
      <VendaDetalhesModal
        venda={vendaSelecionada}
        aberto={modalAberto}
        carregando={carregandoDetalhes}
        onFechar={() => {
          setModalAberto(false);
          setVendaSelecionada(null);
        }}
      />
    </div>
  );
};

export default RelatoriosPage;
