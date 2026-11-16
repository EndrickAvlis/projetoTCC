import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Badge from "../../../../components/ui/Badge";
import { formatarPeriodo } from "../../../../utils/formatters";

const PeriodoResumo = ({ periodoCurso, onEditar, onExcluir }) => {
  if (!periodoCurso) return null;

  const nomePeriodo =
    formatarPeriodo(periodoCurso.periodo) || periodoCurso.periodo;

  return (
    <div className="grid grid-cols-[5rem_4.5rem_6.75rem_auto] items-center gap-x-3 text-sm">
      <span className="font-medium text-text-primary">{nomePeriodo}</span>

      <span className="whitespace-nowrap text-text-secondary">
        {periodoCurso.vagasTotais}{" "}
        {periodoCurso.vagasTotais === 1 ? "vaga" : "vagas"}
      </span>

      <Badge
        variant={periodoCurso.matriculaAtiva ? "success" : "neutral"}
        size="sm"
        className="w-fit whitespace-nowrap text-[11px]"
      >
        Matrícula {periodoCurso.matriculaAtiva ? "aberta" : "fechada"}
      </Badge>

      <div className="flex items-center gap-1.5">
        {onEditar && (
          <button
            type="button"
            onClick={onEditar}
            className="cursor-pointer rounded-md border border-border p-1 text-text-secondary transition-colors hover:border-status-info/40 hover:bg-status-info-bg hover:text-status-info"
            title={`Editar período ${nomePeriodo}`}
            aria-label={`Editar período ${nomePeriodo}`}
          >
            <FiEdit2 size={16} />
          </button>
        )}

        {onExcluir && (
          <button
            type="button"
            onClick={onExcluir}
            className="cursor-pointer rounded-md border border-border p-1 text-text-secondary transition-colors hover:border-status-danger/40 hover:bg-status-danger-bg hover:text-status-danger"
            title={`Excluir período ${nomePeriodo}`}
            aria-label={`Excluir período ${nomePeriodo}`}
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PeriodoResumo;
