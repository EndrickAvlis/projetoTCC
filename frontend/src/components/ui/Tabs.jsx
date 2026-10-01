import * as React from "react";

const Tabs = ({
  itens = [],
  ativo,
  onSelecionar,
  ariaLabel = "Abas de navegação",
  className = "",
}) => {
  return (
    <div
      className={`flex gap-1 border-b border-border ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {itens.map((item) => {
        const Icone = item.icone;
        const estaAtiva = item.id === ativo;
        const temBadge = typeof item.badge === "number" || Boolean(item.badge);

        return (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={estaAtiva}
            aria-controls={`painel-${item.id}`}
            onClick={() => onSelecionar(item.id)}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
              estaAtiva
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {Icone && <Icone className="h-4 w-4" />}
            <span>{item.label}</span>

            {temBadge && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  Number(item.badge) > 0
                    ? "border-status-warning/30 bg-status-warning-bg text-status-warning"
                    : "border-border bg-surface-muted text-text-secondary"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;