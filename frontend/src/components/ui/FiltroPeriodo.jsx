import TableFiltro from "./TableFiltro";
import Input from "./Input";
import { OPCOES_PERIODO } from "../../constants/periodoOptions";

const FiltroPeriodo = ({
  periodo,
  dataInicio = "",
  dataFim = "",
  onPeriodoChange,
  onDataInicioChange,
  onDataFimChange,
  incluirTodo = true,
  ariaLabel = "Filtro de período",
  className = "",
}) => {
  const opcoes = incluirTodo
    ? OPCOES_PERIODO
    : OPCOES_PERIODO.filter((opcao) => opcao.valor !== "TODO");

  const intervaloIncompleto =
    periodo === "PERSONALIZADO" && (!dataInicio || !dataFim);

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <TableFiltro
        options={opcoes}
        value={periodo}
        onChange={onPeriodoChange}
        ariaLabel={ariaLabel}
      />

      {periodo === "PERSONALIZADO" && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Input
              type="date"
              size="md"
              value={dataInicio}
              max={dataFim || undefined}
              onChange={(e) => onDataInicioChange(e.target.value)}
              aria-label="Data de início"
            />
          </div>
          <span className="text-sm text-text-secondary">até</span>
          <div className="w-40">
            <Input
              type="date"
              size="md"
              value={dataFim}
              min={dataInicio || undefined}
              onChange={(e) => onDataFimChange(e.target.value)}
              aria-label="Data de fim"
            />
          </div>
          {intervaloIncompleto && (
            <span className="text-xs text-text-secondary">
              Informe as duas datas
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FiltroPeriodo;
