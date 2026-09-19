import { formatarSenha } from "../../../../utils/formatters";

const PendenciasGrid = ({
  pendencias = [],
  pendenciaSelecionada = null,
  onSelecionarPendencia,
  desabilitada = false,
  className = "",
}) => {
  const renderizarPendencia = (pendencia) => {
    const isSelecionada = pendenciaSelecionada?.senha?.id === pendencia.senha.id;
    const isPrioritaria = pendencia.senha.tipoSenha;

    return (
      <button
        key={pendencia.senha.id}
        type="button"
        className={[
          "min-h-17 rounded-btn border px-2.5 py-2 text-center transition-all duration-150 cursor-pointer",
          isSelecionada
            ? "ring-2 ring-primary border-primary bg-status-info-bg/40 shadow-xs"
            : isPrioritaria
              ? "border-status-warning border-2 bg-status-warning-bg/15 hover:border-status-warning-hover hover:bg-status-warning-bg/25"
              : "border-border bg-page hover:bg-status-info-bg/30 hover:border-primary",
          "focus:outline-none focus:ring-2 focus:ring-focus-ring",
          desabilitada ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}
        disabled={desabilitada}
        onClick={() => onSelecionarPendencia && onSelecionarPendencia(pendencia)}
        aria-label={`Selecionar pendência da senha ${pendencia.senha.codigo}`}
      >
        <div className="font-bold text-primary text-base leading-tight">
          {formatarSenha(pendencia.senha.codigo)}
        </div>
        <div className="text-xs text-text-secondary truncate mt-1 max-w-full">
          {pendencia.aluno.nome}
        </div>
      </button>
    );
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-text-primary text-base">
          Senhas pendentes
        </h3>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-surface-muted text-text-secondary border border-border">
          {pendencias.length}
        </span>
      </div>

      {pendencias.length === 0 ? (
        <p className="flex min-h-20 items-center justify-center rounded-btn border border-border bg-page px-3 text-center text-sm italic text-text-secondary">
          Nenhuma pendência registrada.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {pendencias.map(renderizarPendencia)}
        </div>
      )}
    </div>
  );
};

export default PendenciasGrid;
