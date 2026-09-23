import * as React from "react";
import * as FiIcons from "react-icons/fi";
import Button from "./button";

const gerarTokensPagina = (atual, totalPaginas) => {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }
  const paginas = new Set([1, totalPaginas, atual - 1, atual, atual + 1]);
  const ordenadas = [...paginas]
    .filter((p) => p >= 1 && p <= totalPaginas)
    .sort((a, b) => a - b);

  const tokens = [];
  ordenadas.forEach((p, idx) => {
    if (idx > 0 && p - ordenadas[idx - 1] > 1) {
      tokens.push("…");
    }
    tokens.push(p);
  });
  return tokens;
};

const DataTable = ({
  columns,
  data = [],
  getRowKey,
  emptyMessage = "Nenhum registro encontrado.",
  alturaMaxima = "28rem",
  // Props de Paginação (Opcionais)
  pagina,
  limite = 10,
  total,
  onPaginaChange,
}) => {
  const temPaginacao = pagina !== undefined && onPaginaChange !== undefined;
  const totalRegistros = total ?? data.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));

  const inicio = totalRegistros === 0 ? 0 : (pagina - 1) * limite + 1;
  const fim = Math.min(pagina * limite, totalRegistros);
  const tokens = React.useMemo(
    () => (temPaginacao ? gerarTokensPagina(pagina, totalPaginas) : []),
    [temPaginacao, pagina, totalPaginas],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="overflow-auto" style={{ maxHeight: temPaginacao ? "none" : alturaMaxima }}>
        <table className="min-w-full text-left">
          <thead className="bg-primary/3">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`sticky top-0 z-10 whitespace-nowrap bg-table-head px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${
                    column.headerClassName ?? ""
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm text-text-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className="transition-colors duration-200 ease-out hover:bg-surface-muted"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 text-sm text-text-primary ${
                        column.cellClassName ?? ""
                      }`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé com Paginação Server-Side integrada */}
      {temPaginacao && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border px-5 py-3 sm:flex-row bg-surface">
          <p className="text-sm text-text-secondary">
            {totalRegistros > 0
              ? `Mostrando ${inicio}–${fim} de ${totalRegistros} registro${totalRegistros === 1 ? "" : "s"}`
              : "Nenhum registro para exibir"}
          </p>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagina <= 1}
              onClick={() => onPaginaChange(pagina - 1)}
              aria-label="Página anterior"
              className="px-2"
            >
              <FiIcons.FiChevronLeft size={16} />
            </Button>

            {tokens.map((token, index) => {
              if (token === "…") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-sm text-text-secondary select-none"
                  >
                    …
                  </span>
                );
              }

              const ehPaginaAtual = token === pagina;
              return (
                <Button
                  key={`page-${token}`}
                  size="sm"
                  variant={ehPaginaAtual ? "primary" : "secondary"}
                  onClick={() => onPaginaChange(token)}
                  className={!ehPaginaAtual ? "bg-transparent hover:bg-surface-muted text-text-secondary" : ""}
                >
                  {token}
                </Button>
              );
            })}

            <Button
              size="sm"
              variant="secondary"
              disabled={pagina >= totalPaginas}
              onClick={() => onPaginaChange(pagina + 1)}
              aria-label="Próxima página"
              className="px-2"
            >
              <FiIcons.FiChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;