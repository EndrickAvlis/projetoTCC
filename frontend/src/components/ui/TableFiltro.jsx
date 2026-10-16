const TableFiltro = ({
  options = [],
  value,
  onChange,
  ariaLabel = "Filtro de tabela",
  className = "",
}) => {
  return (
    <div
      className={`flex rounded-btn border border-border p-1 bg-surface ${className}`}
      aria-label={ariaLabel}
    >
      {options.map((opcao) => {
        const ativo = value === opcao.valor;

        return (
          <button
            key={String(opcao.valor)}
            type="button"
            onClick={() => onChange(opcao.valor)}
            aria-pressed={ativo}
            className={`rounded-btn px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              ativo
                ? "bg-primary text-text-inverse shadow-sm"
                : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            }`}
          >
            {opcao.label}
          </button>
        );
      })}
    </div>
  );
};

export default TableFiltro;
