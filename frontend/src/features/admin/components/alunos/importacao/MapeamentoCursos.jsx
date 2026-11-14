import * as React from "react";
import { Link } from "react-router-dom";
import * as FiIcons from "react-icons/fi";
import Alert from "../../../../../components/ui/Alert";
import Badge from "../../../../../components/ui/Badge";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import TableFiltro from "../../../../../components/ui/TableFiltro";

const prioridadeGrupo = (grupo) => {
  if (!grupo.idCurso) return 0;
  if (grupo.tipoAssociacao === "SUGESTAO") return 1;
  return 2;
};

const MapeamentoCursos = ({
  gruposCursos = [],
  cursosExistentes = [],
  onAtualizarAssociacao,
  onCriarCurso,
  onVoltar,
  onConfirmar,
  onRecarregarCursos,
  carregandoCursos = false,
  carregando = false,
}) => {
  const [filtroStatus, setFiltroStatus] = React.useState("TODOS");
  const [busca, setBusca] = React.useState("");

  const opcoesCursos = React.useMemo(
    () =>
      [...cursosExistentes]
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        .map((curso) => ({
          value: String(curso.id),
          label: curso.nome,
        })),
    [cursosExistentes],
  );

  const totalPendentes = gruposCursos.filter((grupo) => !grupo.idCurso).length;
  const totalAssociados = gruposCursos.length - totalPendentes;
  const temPendencias = totalPendentes > 0;
  const totalCandidatos = gruposCursos.reduce(
    (soma, grupo) => soma + (grupo.totalCandidatos || 0),
    0,
  );

  const opcoesFiltro = [
    { valor: "TODOS", label: `Todos (${gruposCursos.length})` },
    { valor: "PENDENTES", label: `Pendentes (${totalPendentes})` },
    { valor: "ASSOCIADOS", label: `Associados (${totalAssociados})` },
  ];

  const gruposFiltrados = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return gruposCursos
      .filter((grupo) => {
        if (filtroStatus === "PENDENTES" && grupo.idCurso) return false;
        if (filtroStatus === "ASSOCIADOS" && !grupo.idCurso) return false;
        if (termo && !grupo.nomeCsv.toLowerCase().includes(termo)) return false;
        return true;
      })
      .sort((a, b) => {
        const diffPrioridade = prioridadeGrupo(a) - prioridadeGrupo(b);
        if (diffPrioridade !== 0) return diffPrioridade;
        return a.nomeCsv.localeCompare(b.nomeCsv, "pt-BR");
      });
  }, [gruposCursos, filtroStatus, busca]);

  const renderBadgeAssociacao = (grupo) => {
    if (!grupo.idCurso) {
      return (
        <Badge
          variant="warning"
          size="sm"
          icon={<FiIcons.FiAlertTriangle size={12} />}
        >
          Pendente
        </Badge>
      );
    }

    if (grupo.tipoAssociacao === "SUGESTAO") {
      return (
        <Badge
          variant="primary"
          size="sm"
          icon={<FiIcons.FiHelpCircle size={12} />}
        >
          Sugestão
        </Badge>
      );
    }

    return (
      <Badge variant="success" size="sm" icon={<FiIcons.FiCheck size={12} />}>
        Associado
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Cursos identificados no arquivo CSV
          </h3>
          <p className="text-xs text-text-secondary">
            {gruposCursos.length}{" "}
            {gruposCursos.length === 1
              ? "curso encontrado"
              : "cursos encontrados"}{" "}
            totalizando <strong>{totalCandidatos} candidatos</strong> válidos
            para importação.
          </p>
        </div>

        {temPendencias ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-warning">
            <FiIcons.FiAlertCircle size={15} />
            {totalPendentes}{" "}
            {totalPendentes === 1 ? "curso precisa" : "cursos precisam"} de
            associação
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-success">
            <FiIcons.FiCheckCircle size={15} />
            Todos os cursos associados
          </span>
        )}
      </div>

      {temPendencias && (
        <Alert
          type="warning"
          message="Cursos sem associação, selecione ou cadastre os cursos que faltam.."
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TableFiltro
          options={opcoesFiltro}
          value={filtroStatus}
          onChange={setFiltroStatus}
          ariaLabel="Filtrar cursos por status de associação"
        />

        <Input
          size="sm"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar curso no CSV..."
          icon={<FiIcons.FiSearch size={15} />}
          className="sm:w-64"
        />
      </div>

      <div className="space-y-2">
        {gruposFiltrados.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-text-secondary">
            Nenhum curso encontrado para o filtro aplicado.
          </div>
        ) : (
          gruposFiltrados.map((grupo) => {
            const associado = Boolean(grupo.idCurso);
            return (
              <div
                key={grupo.chave}
                className={`rounded-xl border px-3.5 py-2.5 transition-colors ${
                  !associado
                    ? "border-status-warning/60 bg-status-warning-bg/10"
                    : "border-border bg-surface hover:border-primary/30"
                }`}
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-text-primary break-words">
                        {grupo.nomeCsv}
                      </h4>
                      {renderBadgeAssociacao(grupo)}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                      {grupo.periodos?.length > 0 && (
                        <>
                          <span>
                            Período{grupo.periodos.length > 1 ? "s" : ""}:{" "}
                            <strong className="text-text-primary uppercase">
                              {grupo.periodos.join(", ")}
                            </strong>
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        Candidatos:{" "}
                        <strong className="text-text-primary">
                          {grupo.totalCandidatos}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:w-[340px] shrink-0">
                    <Select
                      aria-label={`Associar curso ${grupo.nomeCsv}`}
                      placeholder="Selecione um curso..."
                      value={grupo.idCurso || ""}
                      onChange={(e) =>
                        onAtualizarAssociacao(grupo.chave, e.target.value)
                      }
                      options={opcoesCursos}
                      size="sm"
                      selectClassName={
                        !associado
                          ? "border-status-warning focus:ring-status-warning"
                          : ""
                      }
                    />

                    {!associado && onCriarCurso && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onCriarCurso(grupo)}
                        leftIcon={<FiIcons.FiPlus size={14} />}
                        className="shrink-0"
                        title="Cadastrar este curso no sistema"
                      >
                        Criar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between text-xs text-text-secondary">
        <p className="italic">
          * Também é possível gerenciar cursos no{" "}
          <Link
            to="/admin/cursos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary underline hover:text-primary-hover not-italic transition-colors"
          >
            módulo administrativo de Cursos
            <FiIcons.FiExternalLink size={13} />
          </Link>{" "}
          (abre em nova aba) e atualizar a lista ao lado.
        </p>

        {onRecarregarCursos && (
          <button
            type="button"
            onClick={onRecarregarCursos}
            disabled={carregandoCursos}
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-hover hover:underline shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
            title="Atualizar lista de cursos disponíveis e tentar associar pendentes"
          >
            <FiIcons.FiRefreshCw
              size={12}
              className={carregandoCursos ? "animate-spin" : ""}
            />
            {carregandoCursos ? "Atualizando cursos..." : "Atualizar lista"}
          </button>
        )}
      </div>

      <div className="sticky -bottom-6 -mx-6 bg-surface border-t border-border px-6 py-4 flex items-center justify-between z-10">
        <Button
          type="button"
          variant="secondary"
          onClick={onVoltar}
          disabled={carregando}
          leftIcon={<FiIcons.FiArrowLeft size={18} />}
        >
          Voltar
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onConfirmar}
          disabled={temPendencias || carregando}
          loading={carregando}
          rightIcon={<FiIcons.FiCheck size={18} />}
        >
          {carregando ? "Importando..." : "Confirmar Importação"}
        </Button>
      </div>
    </div>
  );
};

export default MapeamentoCursos;
