import * as FiIcons from "react-icons/fi";
import Badge from "../../../../components/ui/Badge";

const nomesPeriodos = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
  online: "Online",
};

const formatarPeriodo = (periodo) => nomesPeriodos[periodo] ?? periodo;

const PeriodoResumo = ({ periodoCurso, onEditar }) => (
  <div className="grid grid-cols-[5rem_4.5rem_6.75rem_2.25rem] items-center gap-x-3 text-sm">
    <span className="font-medium text-text-primary">
      {formatarPeriodo(periodoCurso.periodo)}
    </span>

    <span className="whitespace-nowrap text-text-secondary">
      {periodoCurso.vagasTotais} vagas
    </span>

    <Badge
      variant={periodoCurso.matriculaAtiva ? "success" : "neutral"}
      size="sm"
      className="w-fit whitespace-nowrap text-[11px]"
    >
      Matrícula {periodoCurso.matriculaAtiva ? "aberta" : "fechada"}
    </Badge>

    {onEditar && (
      <button
        type="button"
        onClick={onEditar}
        className="justify-self-end rounded-md border border-border p-1 text-text-secondary transition-colors hover:bg-surface-muted hover:text-primary"
        title={`Editar período ${formatarPeriodo(periodoCurso.periodo)}`}
        aria-label={`Editar período ${formatarPeriodo(periodoCurso.periodo)}`}
      >
        <FiIcons.FiEdit2 size={16} />
      </button>
    )}
  </div>
);

export default PeriodoResumo;
