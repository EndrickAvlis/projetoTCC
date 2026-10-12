import * as React from "react";
import { Link } from "react-router-dom";
import * as FiIcons from "react-icons/fi";
import Alert from "../../../../../components/ui/Alert";
import Badge from "../../../../../components/ui/Badge";
import Button from "../../../../../components/ui/Button";
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
  const opcoesCursos = cursosExistentes.map((curso) => ({
    value: String(curso.id),
    label: curso.nome,
  }));

  const totalPendentes = gruposCursos.filter((grupo) => !grupo.idCurso).length;
  const temPendencias = totalPendentes > 0;
  const totalCandidatos = gruposCursos.reduce(
    (soma, grupo) => soma + (grupo.totalCandidatos || 0),
    0,
  );

  const renderBadgeAssociacao = (grupo) => {
    if (!grupo.idCurso) {
      return (
        <Badge variant="warning" size="md" icon={<FiIcons.FiAlertTriangle size={13} />}>
          Pendente
        </Badge>
      );
    }

    if (grupo.tipoAssociacao === "SUGESTAO") {
      return (
        <Badge variant="primary" size="md" icon={<FiIcons.FiHelpCircle size={13} />}>
          Sugestão por Nome
        </Badge>
      );
    }

    return (
      <Badge variant="success" size="md" icon={<FiIcons.FiCheck size={13} />}>
        Associado
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {erro && <Alert type="error" message={erro} />}

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
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
          <span className="inline-flex items-center gap-1 text-xs font-medium text-status-warning">
            <FiIcons.FiAlertCircle size={15} />
            {totalPendentes}{" "}
            {totalPendentes === 1 ? "curso precisa" : "cursos precisam"} de
            associação
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
              key={grupo.chave}
              className={`rounded-xl border p-4 transition-colors ${
                !associado
                  ? "border-status-warning/60 bg-status-warning-bg/10"
                  : "border-border bg-surface hover:border-primary/30"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {grupo.nomeCsv}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
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

                <div className="self-start">{renderBadgeAssociacao(grupo)}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60">
                <Select
                  label="Associar ao Curso no Sistema:"
                  labelClassName="text-xs font-medium text-text-secondary"
                  placeholder="Selecione um curso existente..."
                  value={grupo.idCurso || ""}
                  onChange={(e) =>
                    onAtualizarAssociacao(grupo.chave, e.target.value)
                  }
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
          * Caso o curso desejado não esteja listado nas opções, você pode
          cadastrá-lo no{" "}
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
