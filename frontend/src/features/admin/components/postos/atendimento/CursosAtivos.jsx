import CardRetratil from "../../../../../components/ui/CardRetratil";
import Badge from "../../../../../components/ui/Badge";

const CursosAtivos = ({ cursos = [] }) => {
  return (
    <CardRetratil
      titulo="Cursos ativos"
      subtitulo="Com matrícula disponível"
      abertoInicialmente={true}
      badge={<Badge size="sm">{cursos.length} cursos</Badge>}
      className="w-full"
    >
      {cursos.length === 0 ? (
        <p className="text-xs italic text-text-secondary py-4 text-center">
          Nenhum curso ativo no momento.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {cursos.map((curso) => (
            <div
              key={curso.id}
              className="p-3.5 rounded-lg border border-border bg-surface flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <h5 className="text-sm font-semibold text-text-primary truncate">
                  {curso.nome}
                </h5>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {curso.periodos.map((periodo) => (
                    <span
                      key={periodo}
                      className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-primary/10 text-primary capitalize"
                    >
                      {periodo}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-bold text-text-primary tabular-nums block">
                  {curso.candidatosPeriodo}
                </span>
                <span className="text-[11px] text-text-secondary block">
                  candidatos
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardRetratil>
  );
};

export default CursosAtivos;
