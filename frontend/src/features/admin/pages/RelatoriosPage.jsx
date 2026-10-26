import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import TableFiltro from "../../../components/ui/TableFiltro";
import PainelReceita from "../components/relatorios/PainelReceita";
import VendaDetalhesModal from "../components/relatorios/VendaDetalhesModal";
import { useCursos } from "../hooks/useCursos";
import { useUsuarios } from "../hooks/useUsuarios";
import { useRelatorios } from "../hooks/useRelatorios";
import { exportarRelatorio, detalheVenda } from "../services/relatorioService";
import { formatarMoeda, formatarDataHora } from "../../../utils/formatters";

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
  const [exportando, setExportando] = React.useState(false);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [carregandoDetalhes, setCarregandoDetalhes] = React.useState(false);
  const [vendaSelecionada, setVendaSelecionada] = React.useState(null);
  const {
    resumoReceita,
    vendas,
    totalVendas,
    carregando: carregandoVendas,
  } = useRelatorios({ ...filtros, pagina, limite: 10 });

  const handleAbrirDetalhes = async (idVenda) => {
    setModalAberto(true);
    setCarregandoDetalhes(true);
    try {
      const res = await detalheVenda(idVenda);
      setVendaSelecionada(res?.venda ?? null);
    } catch {
      setVendaSelecionada(null);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  const { cursos } = useCursos();
  const { usuarios } = useUsuarios();

  const alterarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_INICIAIS);
    setPagina(1);
  };

  const colunasVendas = [
    {
      key: "dataHora",
      label: "Data / Hora",
      render: (venda) => (
        <span className="text-xs font-medium text-text-primary">
          {formatarDataHora(venda.dataHora)}
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
        new Blob([blob], { type: "text/csv;charset=utf-8;" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `extrato-vendas-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <p className=" text-text-secondary">
          {totalVendas}{" "}
          {totalVendas === 1 ? "venda encontrada." : "vendas encontradas."}
        </p>

        <Button
          variant="primary"
          leftIcon={<FiIcons.FiDownload size={18} />}
          onClick={handleExportar}
          loading={exportando}
          disabled={exportando}
        >
          {exportando ? "Exportando..." : "Exportar Relatório"}
        </Button>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-2">
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

          <div className="flex-1">
            <Select
              placeholder="Todas as formas"
              value={filtros.formaPagamento}
              onChange={(e) => alterarFiltro("formaPagamento", e.target.value)}
              options={OPCOES_FORMA_PAGAMENTO}
              size="md"
            />
          </div>

          <div className="flex-1">
            <Select
              placeholder="Todas as entradas"
              value={filtros.tipoReceita}
              onChange={(e) => alterarFiltro("tipoReceita", e.target.value)}
              options={OPCOES_TIPO_RECEITA}
              size="md"
            />
          </div>

          <div className="flex-1">
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
            onClick={limparFiltros}
            className="shrink-0 px-3.5"
            title="Limpar filtros"
          >
            Limpar
          </Button>
        </div>
      </section>
      <PainelReceita
        resumoReceita={resumoReceita}
        carregando={carregandoVendas}
      />
      <section className="space-y-4">
        <DataTable
          columns={colunasVendas}
          data={vendas}
          carregando={carregandoVendas}
          getRowKey={(v) => v.id}
          pagina={pagina}
          limite={10}
          total={totalVendas}
          onPaginaChange={setPagina}
          emptyMessage="Nenhuma venda registrada para os filtros selecionados."
        />
      </section>
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
