const DataTable = ({
  columns,
  data = [],
  getRowKey,
  emptyMessage = "Nenhum registro encontrado.",
  alturaMaxima = "28rem"
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div
        className="overflow-auto"
        style={{ maxHeight: alturaMaxima }}
      >
        <table className="min-w-full text-left">
          <thead className="bg-primary/3">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`sticky top-0 z-10 whitespace-nowrap bg-table-head px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${column.headerClassName ?? ""
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
                      className={`px-5 py-4 text-sm text-text-primary ${column.cellClassName ?? ""
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
    </div>
  );
};

export default DataTable;
