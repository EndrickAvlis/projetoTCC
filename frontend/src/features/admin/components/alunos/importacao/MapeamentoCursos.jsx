import * as React from "react";
import { Link } from "react-router-dom";
import * as FiIcons from "react-icons/fi";
import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/button";
import Select from "../../../../../components/ui/Select";

const MapeamentoCursos = ({
  gruposCursos = [],
  cursosExistentes = [],
  onAtualizarAssociacao,
  onVoltar,
  onConfirmar,
  onRecarregarCursos,
  carregandoCursos = false,
  carregando = false,
  erro = null,
}) => {
  const opcoesCursos = React.useMemo(() => {
    return cursosExistentes.map((curso) => ({
      value: String(curso.id),
      label: curso.codigoCsv ? `${curso.nome} (Código: ${curso.codigoCsv})` : curso.nome,
    }));
  }, [cursosExistentes]);

  const pendentes = React.useMemo(() => {
    return gruposCursos.filter((grupo) => !grupo.idCurso);
  }, [gruposCursos]);

  const temPendencias = pendentes.length > 0;
  const totalCandidatos = React.useMemo(() => {
    return gruposCursos.reduce((soma, grupo) => soma + (grupo.totalCandidatos || 0), 0);
  }, [gruposCursos]);

  const obterBadgeAssociacao = (grupo) => {
    if (!grupo.idCurso) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-status-warning-bg px-2.5 py-1 text-xs font-semibold text-status-warning border border-status-warning/30">
          <FiIcons.FiAlertTriangle size={13} />
          Pendente
        </span>
      );
    }

    if (grupo.tipoAssociacao === "RECONHECIDO") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-status-success-bg px-2.5 py-1 text-xs font-semibold text-status-success border border-status-success/30">
          <FiIcons.FiCheckCircle size={13} />
          Reconhecido
        </span>
      );
    }

    if (grupo.tipoAssociacao === "SUGESTAO") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20">
          <FiIcons.FiHelpCircle size={13} />
          Sugestão por Nome
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-info-bg px-2.5 py-1 text-xs font-semibold text-status-info border border-status-info/30">
        <FiIcons.FiCheck size={13} />
        Associado
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {erro && (
        <Alert
          type="error"
          message={erro}
        />
      )}

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Cursos identificados no arquivo CSV
          </h3>
          <p className="text-xs text-text-secondary">
            {gruposCursos.length} {gruposCursos.length === 1 ? "curso encontrado" : "cursos encontrados"} totalizando{" "}
            <strong>{totalCandidatos} candidatos</strong> válidos para importação.
          </p>
        </div>

        {temPendencias ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-status-warning">
            <FiIcons.FiAlertCircle size={15} />
            {pendentes.length} {pendentes.length === 1 ? "curso precisa" : "cursos precisam"} de associação
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-status-success">
            <FiIcons.FiCheckCircle size={15} />
            Todos os cursos associados
          </span>
        )}
      </div>

      {temPendencias && (
        <Alert
          type="warning"
          message="É necessário associar todos os cursos do arquivo a um curso correspondente do sistema antes de confirmar a importação."
        />
      )}

      <div className="space-y-3">
        {gruposCursos.map((grupo) => {
          const associado = Boolean(grupo.idCurso);
          return (
            <div
              key={grupo.codigoCsv}
              className={`rounded-xl border p-4 transition-colors ${
                !associado
                  ? "border-status-warning/60 bg-status-warning-bg/10"
                  : "border-border bg-surface hover:border-primary/30"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-muted text-text-primary border border-border">
                      Cód: {grupo.codigoCsv}
                    </span>
                    <h4 className="text-sm font-semibold text-text-primary">
                      {grupo.nomeCsv}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    <span>
                      Período no CSV: <strong className="text-text-primary">{grupo.periodo || "—"}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Candidatos: <strong className="text-text-primary">{grupo.totalCandidatos}</strong>
                    </span>
                  </div>
                </div>

                <div className="self-start">
                  {obterBadgeAssociacao(grupo)}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60">
                <Select
                  label="Associar ao Curso no Sistema:"
                  labelClassName="text-xs font-medium text-text-secondary"
                  placeholder="Selecione um curso existente..."
                  value={grupo.idCurso || ""}
                  onChange={(e) => onAtualizarAssociacao(grupo.codigoCsv, e.target.value)}
                  options={opcoesCursos}
                  size="sm"
                  error={!associado ? "Selecione o curso correspondente" : ""}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between text-xs text-text-secondary">
        <p className="italic">
          * Caso o curso desejado não esteja listado nas opções, você pode cadastrá-lo no{" "}
          <Link
            to="/admin/cursos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary underline hover:text-primary-hover not-italic transition-colors"
          >
            módulo administrativo de Cursos
            <FiIcons.FiExternalLink size={13} />
          </Link>{" "}
          (abre em nova aba) antes de realizar a importação.
        </p>

        {onRecarregarCursos && (
          <button
            type="button"
            onClick={onRecarregarCursos}
            disabled={carregandoCursos}
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-hover hover:underline shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
            title="Atualizar lista de cursos disponíveis"
          >
            <FiIcons.FiRefreshCw size={12} className={carregandoCursos ? "animate-spin" : ""} />
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
