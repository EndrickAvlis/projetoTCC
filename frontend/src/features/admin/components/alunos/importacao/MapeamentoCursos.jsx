import * as React from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiExternalLink,
  FiPlus,
  FiRefreshCw,
  FiRotateCcw,
  FiSearch,
} from "react-icons/fi";
import Badge from "../../../../../components/ui/Badge";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import TableFiltro from "../../../../../components/ui/TableFiltro";
import { formatarPeriodo } from "../../../../../utils/formatters";

const badge = (grupo, cursoArquivado, temPeriodoFaltante) => {
  if (!grupo.idCurso) {
    return (
      <Badge
        variant="info"
        size="sm"
      >
        Associação pendente
      </Badge>
    );
  }

  if (cursoArquivado) {
    return (
      <Badge variant="warning" size="sm">
        Curso arquivado
      </Badge>
    );
  }

  if (temPeriodoFaltante) {
    return (
      <Badge
        variant="warning"
        size="sm"
      >
        Sem período
      </Badge>
    );
  }

  return null;
};

const MapeamentoCursos = ({
  gruposCursos = [],
  cursosExistentes = [],
  onAtualizarAssociacao,
  onCriarCurso,
  onDesarquivarCurso,
  onAdicionarPeriodo,
  onVoltar,
  onConfirmar,
  onRecarregarCursos,
  carregandoCursos = false,
  carregando = false,
}) => {
  const [filtroStatus, setFiltroStatus] = React.useState("TODOS");
  const [busca, setBusca] = React.useState("");

  const cursosPorId = new Map(cursosExistentes.map((c) => [String(c.id), c]));

  const opcoesCursos = [...cursosExistentes]
    .sort((a, b) => {
      if (Boolean(a.arquivado) !== Boolean(b.arquivado)) {
        return a.arquivado ? 1 : -1;
      }
      return a.nome.localeCompare(b.nome, "pt-BR");
    })
    .map((curso) => ({
      value: String(curso.id),
      label: curso.arquivado ? `${curso.nome} (Arquivado)` : curso.nome,
    }));

  let totalPendentes = 0;
  let totalCandidatos = 0;

  const gruposDetalhados = gruposCursos.map((grupo) => {
    const associado = Boolean(grupo.idCurso);
    const cursoSelecionado = associado
      ? (cursosPorId.get(String(grupo.idCurso)) ?? null)
      : null;
    const cursoArquivado = Boolean(cursoSelecionado?.arquivado);
    const periodosCadastrados = new Set(
      (cursoSelecionado?.periodos ?? []).map((p) => p.periodo),
    );
    const periodosFaltantes = cursoSelecionado
      ? (grupo.periodos ?? []).filter((p) => !periodosCadastrados.has(p))
      : [];
    const temPeriodoFaltante = !cursoArquivado && periodosFaltantes.length > 0;
    const precisaAcao = !associado || cursoArquivado || temPeriodoFaltante;

    if (precisaAcao) totalPendentes += 1;
    totalCandidatos += grupo.totalCandidatos || 0;

    return {
      ...grupo,
      associado,
      cursoSelecionado,
      cursoArquivado,
      periodosFaltantes,
      temPeriodoFaltante,
      precisaAcao,
    };
  });

  const totalAssociados = gruposCursos.length - totalPendentes;
  const temPendencias = totalPendentes > 0;

  const opcoesFiltro = [
    { valor: "TODOS", label: `Todos (${gruposCursos.length})` },
    { valor: "PENDENTES", label: `Pendentes (${totalPendentes})` },
    { valor: "ASSOCIADOS", label: `Associados (${totalAssociados})` },
  ];

  const pesquisa = busca.trim().toLowerCase();

  const gruposFiltrados = gruposDetalhados
    .filter((grupo) => {
      if (filtroStatus === "PENDENTES" && !grupo.precisaAcao) return false;
      if (filtroStatus === "ASSOCIADOS" && grupo.precisaAcao) return false;
      if (pesquisa && !grupo.nomeCsv.toLowerCase().includes(pesquisa)) return false;
      return true;
    })
    .sort((a, b) => a.nomeCsv.localeCompare(b.nomeCsv, "pt-BR"));

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
            <FiAlertCircle size={15} />
            {totalPendentes}{" "}
            {totalPendentes === 1 ? "curso pendente" : "cursos pendentes"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-success">
            <FiCheckCircle size={15} />
            Todos os cursos associados
          </span>
        )}
      </div>

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
          icon={<FiSearch size={15} />}
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
            const {
              associado,
              cursoSelecionado,
              cursoArquivado,
              periodosFaltantes,
              temPeriodoFaltante,
              precisaAcao,
            } = grupo;

            return (
              <div
                key={grupo.chave}
                className={`rounded-xl border px-3.5 py-2.5 transition-colors ${
                  precisaAcao
                    ? "border-status-warning/60 bg-status-warning-bg/10"
                    : "border-border bg-surface hover:border-primary/30"
                }`}
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-text-primary">
                        {grupo.nomeCsv}
                      </h4>
                      {badge(
                        grupo,
                        cursoArquivado,
                        temPeriodoFaltante,
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                      {grupo.periodos?.length > 0 && (
                        <>
                          <span>
                            Período{grupo.periodos.length > 1 ? "s" : ""}:{" "}
                            <strong className="text-text-primary">
                              {grupo.periodos
                                .map((p) => formatarPeriodo(p) || p)
                                .join(", ")}
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
                      {temPeriodoFaltante && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-status-warning">
                            Falta cadastrar:{" "}
                            {periodosFaltantes
                              .map((p) => formatarPeriodo(p) || p)
                              .join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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
                        precisaAcao
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
                        leftIcon={<FiPlus size={14} />}
                        className="shrink-0"
                        title="Cadastrar este curso no sistema"
                      >
                        Criar
                      </Button>
                    )}

                    {cursoArquivado && onDesarquivarCurso && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          onDesarquivarCurso({
                            chave: grupo.chave,
                            curso: cursoSelecionado,
                          })
                        }
                        leftIcon={<FiRotateCcw size={14} />}
                        className="shrink-0"
                        title="Desarquivar este curso no sistema"
                      >
                        Desarquivar
                      </Button>
                    )}

                    {temPeriodoFaltante && onAdicionarPeriodo && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          onAdicionarPeriodo({
                            curso: cursoSelecionado,
                            periodoInicial: periodosFaltantes[0],
                          })
                        }
                        leftIcon={<FiPlus size={14} />}
                        className="shrink-0"
                        title="Adicionar período faltante a este curso"
                      >
                        Adicionar período
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
            <FiExternalLink size={13} />
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
            <FiRefreshCw
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
          leftIcon={<FiArrowLeft size={18} />}
        >
          Voltar
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onConfirmar}
          disabled={temPendencias || carregando}
          loading={carregando}
          rightIcon={<FiCheck size={18} />}
        >
          {carregando ? "Importando..." : "Confirmar Importação"}
        </Button>
      </div>
    </div>
  );
};

export default MapeamentoCursos;
