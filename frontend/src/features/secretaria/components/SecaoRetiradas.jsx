import * as React from "react";
import { FiSearch, FiRotateCcw, FiBox } from "react-icons/fi";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import TableMenuActions from "../../../components/ui/TableMenuActions";
import RetiradaModal from "./RetiradaModal";
import { useCursos } from "../../admin/hooks/useCursos";
import { formatarDataHora } from "../../../utils/formatters";

const formatarPeriodo = (periodo) => {
  switch (periodo) {
    case "manha":
      return "Manhã";
    case "tarde":
      return "Tarde";
    case "noite":
      return "Noite";
    case "integral":
      return "Integral";
    case "online":
      return "EAD - Online";
    default:
      return periodo || "—";
  }
};

const SecaoRetiradas = ({
  compras = [],
  total = 0,
  pagina = 1,
  limite = 8,
  carregando = false,
  erro = null,
  busca = "",
  cursoId = "",
  onAlterarFiltro,
  onLimparFiltros,
  onMudarPagina,
  onRecarregar,
}) => {
  const { cursos } = useCursos();
  const [modalAberto, setModalAberto] = React.useState(false);
  const [compraSelecionada, setCompraSelecionada] = React.useState(null);

  const opcoesCursos = React.useMemo(() => [
    { value: "", label: "Todos os cursos" },
    ...cursos.map((c) => ({
      value: String(c.id),
      label: c.nome,
    })),
  ], [cursos]);

  const handleAbrirModal = (compra) => {
    setCompraSelecionada(compra);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setCompraSelecionada(null);
  };

  const temFiltroAtivo = Boolean(busca.trim() || cursoId);

  const colunas = [
    {
      key: "codigo",
      label: "Código",
      render: (compra) => (
        <span className="font-mono font-bold text-primary text-xs tracking-wider">
          {compra.codigo || compra.codigoRetirada || `#${compra.id}`}
        </span>
      ),
    },
    {
      key: "aluno",
      label: "Aluno",
      render: (compra) => (
        <span className="font-semibold text-text-primary text-sm">
          {compra.aluno?.nome || "—"}
        </span>
      ),
    },
    {
      key: "curso",
      label: "Curso",
      render: (compra) => (
        <span className="text-text-primary text-xs font-medium">
          {compra.aluno?.curso || "—"}
        </span>
      ),
    },
    {
      key: "periodoAno",
      label: "Período / Ano",
      render: (compra) => {
        const periodo = compra.aluno?.periodo
          ? formatarPeriodo(compra.aluno.periodo)
          : null;
        const ano = compra.aluno?.ano ? `${compra.aluno.ano}º Ano` : null;
        const texto = [periodo, ano].filter(Boolean).join(" — ");
        return <span className="text-text-secondary text-xs">{texto || "—"}</span>;
      },
    },
    {
      key: "dataHora",
      label: "Data da Compra",
      render: (compra) => (
        <span className="text-text-secondary text-xs">
          {formatarDataHora(compra.dataHoraCompra || compra.dataHora)}
        </span>
      ),
    },
    {
      key: "pendentes",
      label: "Itens Pendentes",
      render: (compra) => {
        const qtd = compra.quantidadePendente ?? compra.itensPendentes ?? 0;
        return (
          <span className="rounded-sm bg-status-warning-bg px-2 py-0.5 text-xs font-bold text-status-warning whitespace-nowrap">
            {qtd} {qtd === 1 ? "item pendente" : "itens pendentes"}
          </span>
        );
      },
    },
    {
      key: "acoes",
      label: "Ação",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (compra) => (
        <TableMenuActions
          itens={[
            {
              label: "Registrar retirada",
              icone: FiBox,
              onClick: () => handleAbrirModal(compra),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {erro && <Alert type="error" message={erro} />}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              icon={<FiSearch />}
              iconPosition="left"
              placeholder="Buscar por nome do aluno ou código da compra..."
              value={busca}
              onChange={(e) => onAlterarFiltro("busca", e.target.value)}
              size="md"
            />
          </div>

          <div className="w-full sm:w-60">
            <Select
              aria-label="Filtrar por curso"
              value={cursoId}
              onChange={(e) => onAlterarFiltro("cursoId", e.target.value)}
              options={opcoesCursos}
              size="md"
            />
          </div>

          {temFiltroAtivo && (
            <Button
              variant="secondary"
              size="md"
              onClick={onLimparFiltros}
              leftIcon={<FiRotateCcw />}
              title="Limpar filtros"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={colunas}
        data={compras}
        getRowKey={(compra) => compra.id}
        emptyMessage="Nenhuma compra com retirada pendente encontrada."
        carregando={carregando}
        pagina={pagina}
        limite={limite}
        total={total}
        onPaginaChange={onMudarPagina}
      />

      <RetiradaModal
        aberto={modalAberto}
        onFechar={handleFecharModal}
        compra={compraSelecionada}
        onSucesso={onRecarregar}
      />
    </div>
  );
};

export default SecaoRetiradas;
