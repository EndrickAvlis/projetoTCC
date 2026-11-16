import * as React from "react";
import { FiEye, FiDownload, FiRotateCcw } from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import FiltroPeriodo from "../../../components/ui/FiltroPeriodo";
import Select from "../../../components/ui/Select";
import PainelReceita from "../components/relatorios/PainelReceita";
import VendaDetalhesModal from "../components/relatorios/VendaDetalhesModal";
import { useCursos } from "../hooks/useCursos";
import { useUsuarios } from "../hooks/useUsuarios";
import { useRelatorios } from "../hooks/useRelatorios";
import { exportarRelatorio, detalheVenda } from "../services/relatorioService";
import { formatarMoeda, formatarDataHora } from "../../../utils/formatters";
import { useToast } from "../../../context/toastContext";

const OPCOES_FORMA_PAGAMENTO = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "debito", label: "Cartão de Débito" },
  { value: "credito", label: "Cartão de Crédito" },
];

const FILTROS_INICIAIS = {
  periodo: "TODO",
  dataInicio: "",
  dataFim: "",
  cursoId: "",
  formaPagamento: "",
  atendenteId: "",
};

const ITENS_POR_PAGINA = 8;

const RelatoriosPage = () => {
  const toast = useToast();
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
    erro,
  } = useRelatorios({ ...filtros, pagina, limite: ITENS_POR_PAGINA });

  const handleAbrirDetalhes = async (idVenda) => {
    setModalAberto(true);
    setCarregandoDetalhes(true);
    try {
      const res = await detalheVenda(idVenda);
      setVendaSelecionada(res.venda);
    } catch (err) {
      setVendaSelecionada(null);
      toast.erro(err.message);
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
          leftIcon={<FiEye size={14} />}
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
    } catch (err) {
      toast.erro(err.message);
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
          onClick={handleExportar}
          disabled={exportando || totalVendas === 0}
          leftIcon={<FiDownload size={18} />}
          variant="primary"
        >
          {exportando ? "Exportando..." : "Exportar Extrato"}
        </Button>
      </header>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <div className="border-b border-border pb-4">
          <FiltroPeriodo
            periodo={filtros.periodo}
            dataInicio={filtros.dataInicio}
            dataFim={filtros.dataFim}
            onPeriodoChange={(valor) => alterarFiltro("periodo", valor)}
            onDataInicioChange={(valor) => alterarFiltro("dataInicio", valor)}
            onDataFimChange={(valor) => alterarFiltro("dataFim", valor)}
            ariaLabel="Período do relatório"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="w-full sm:w-56">
            <Select
              placeholder="Todas as formas"
              value={filtros.formaPagamento}
              onChange={(e) => alterarFiltro("formaPagamento", e.target.value)}
              options={OPCOES_FORMA_PAGAMENTO}
              size="md"
              aria-label="Forma de pagamento"
            />
          </div>

          <div className="w-full sm:w-60">
            <Select
              placeholder="Todos os cursos"
              value={filtros.cursoId}
              onChange={(e) => alterarFiltro("cursoId", e.target.value)}
              options={cursos.map((c) => ({
                value: String(c.id),
                label: c.nome,
              }))}
              size="md"
              aria-label="Curso do aluno"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              placeholder="Todos os atendentes"
              value={filtros.atendenteId}
              onChange={(e) => alterarFiltro("atendenteId", e.target.value)}
              options={usuarios.map((u) => ({
                value: String(u.id),
                label: u.nome,
              }))}
              size="md"
              aria-label="Atendente da APM"
            />
          </div>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<FiRotateCcw size={15} />}
            onClick={limparFiltros}
            className="shrink-0 px-3.5"
            title="Limpar filtros"
          >
            Limpar
          </Button>
        </div>
      </section>

      {erro && <Alert type="warning" message={erro} />}

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
          limite={ITENS_POR_PAGINA}
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
