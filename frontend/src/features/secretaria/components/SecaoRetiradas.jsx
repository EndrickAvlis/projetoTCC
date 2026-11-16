import * as React from "react";
import { FiSearch, FiRotateCcw, FiBox } from "react-icons/fi";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import TableMenuActions from "../../../components/ui/TableMenuActions";
import RetiradaModal from "./RetiradaModal";
import { useSecretaria } from "../hooks/useSecretaria";
import { useCursos } from "../../admin/hooks/useCursos";
import { formatarDataHora, formatarPeriodo } from "../../../utils/formatters";

const ITENS_POR_PAGINA = 8;

const SecaoRetiradas = ({ onRetiradaRegistrada }) => {
  const [busca, setBusca] = React.useState("");
  const [cursoId, setCursoId] = React.useState("");
  const [pagina, setPagina] = React.useState(1);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [compraSelecionada, setCompraSelecionada] = React.useState(null);

  const { compras, total, carregando, erro, recarregar } = useSecretaria({
    busca,
    cursoId,
    pagina,
    limite: ITENS_POR_PAGINA,
  });

  const { cursos } = useCursos({ arquivado: false });

  const opcoesCursos = cursos.map((c) => ({
    value: String(c.id),
    label: c.nome,
  }));

  const alterarFiltro = (campo, valor) => {
    if (campo === "busca") setBusca(valor);
    if (campo === "cursoId") setCursoId(valor);
    setPagina(1);
  };

  const limparFiltros = () => {
    setBusca("");
    setCursoId("");
    setPagina(1);
  };

  const handleAbrirModal = (compra) => {
    setCompraSelecionada(compra);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setCompraSelecionada(null);
  };

  const handleSucessoRetirada = () => {
    recarregar();
    onRetiradaRegistrada?.();
  };

  const temFiltroAtivo = Boolean(busca.trim() || cursoId);

  const colunas = [
    {
      key: "codigoRetirada",
      label: "Código",
      render: (compra) => (
        <span className="font-mono font-bold text-primary text-xs tracking-wider">
          {compra.codigoRetirada}
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
        const periodo = formatarPeriodo(compra.aluno?.periodo);
        const ano = compra.aluno?.anoEscolar ? `${compra.aluno.anoEscolar}º Ano` : null;
        const texto = [periodo, ano].filter(Boolean).join(" — ");
        return <span className="text-text-secondary text-xs">{texto || "—"}</span>;
      },
    },
    {
      key: "dataHora",
      label: "Data da Compra",
      render: (compra) => (
        <span className="text-text-secondary text-xs">
          {formatarDataHora(compra.dataHora)}
        </span>
      ),
    },
    {
      key: "pendentes",
      label: "Itens Pendentes",
      render: (compra) => (
        <span className="rounded-sm bg-status-warning-bg px-2 py-0.5 text-xs font-bold text-status-warning whitespace-nowrap">
          {compra.quantidadePendente}{" "}
          {compra.quantidadePendente === 1 ? "item pendente" : "itens pendentes"}
        </span>
      ),
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 min-w-50">
            <Input
              icon={<FiSearch />}
              iconPosition="left"
              placeholder="Buscar por nome do aluno ou código da compra..."
              value={busca}
              onChange={(e) => alterarFiltro("busca", e.target.value)}
              size="md"
            />
          </div>

          <div className="w-full sm:w-60">
            <Select
              aria-label="Filtrar por curso"
              placeholder="Todos os cursos"
              value={cursoId}
              onChange={(e) => alterarFiltro("cursoId", e.target.value)}
              options={opcoesCursos}
              size="md"
            />
          </div>

          {temFiltroAtivo && (
            <Button
              variant="secondary"
              size="md"
              onClick={limparFiltros}
              leftIcon={<FiRotateCcw />}
              title="Limpar filtros"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      {erro && <Alert type="error" message={erro} />}

      <DataTable
        columns={colunas}
        data={compras}
        getRowKey={(compra) => compra.id}
        emptyMessage="Nenhuma compra com retirada pendente encontrada."
        carregando={carregando}
        pagina={pagina}
        limite={ITENS_POR_PAGINA}
        total={total}
        onPaginaChange={setPagina}
      />

      {modalAberto && (
        <RetiradaModal
          aberto={modalAberto}
          onFechar={handleFecharModal}
          compra={compraSelecionada}
          onSucesso={handleSucessoRetirada}
        />
      )}
    </div>
  );
};

export default SecaoRetiradas;
