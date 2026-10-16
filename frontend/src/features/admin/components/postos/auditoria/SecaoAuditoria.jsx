import * as React from "react";
import * as FiIcons from "react-icons/fi";
import DataTable from "../../../../../components/ui/DataTable";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import Button from "../../../../../components/ui/Button";
import Badge from "../../../../../components/ui/Badge";
import TableFiltro from "../../../../../components/ui/TableFiltro";
import SenhaModal from "../SenhaModal";
import { useAuditoria } from "../../../hooks/postos/useAuditoria";
import { formatarSenha } from "../../../../../utils/formatters";

import { OPCOES_TIPO_PERIODO, OPCOES_STATUS } from "../../../constants/postos";

const SecaoAuditoria = () => {
  const [busca, setBusca] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [tipoPeriodo, setTipoPeriodo] = React.useState("hoje");
  const [dataInicio, setDataInicio] = React.useState("");
  const [dataFim, setDataFim] = React.useState("");
  const [pagina, setPagina] = React.useState(1);

  const [popoverAberto, setPopoverAberto] = React.useState(false);
  const popoverRef = React.useRef(null);

  const [senhaSelecionada, setSenhaSelecionada] = React.useState(null);

  const { senhas, total, recarregar } = useAuditoria({
    busca,
    status: status || undefined,
    tipoPeriodo,
    dataInicio: tipoPeriodo === "personalizado" ? dataInicio : undefined,
    dataFim: tipoPeriodo === "personalizado" ? dataFim : undefined,
    pagina,
    limite: 7,
  });

  React.useEffect(() => {
    const fecharAoClicarFora = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverAberto(false);
      }
    };

    if (popoverAberto) {
      document.addEventListener("mousedown", fecharAoClicarFora);
    }
    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
    };
  }, [popoverAberto]);

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
    setPagina(1);
  };

  const handleTipoPeriodoChange = (e) => {
    const valor = e.target.value;
    setTipoPeriodo(valor);
    setPagina(1);
    if (valor === "personalizado") {
      setPopoverAberto(true);
    } else {
      setPopoverAberto(false);
    }
  };

  const handleStatusChange = (novoStatus) => {
    setStatus(novoStatus);
    setPagina(1);
  };

  const opcoesPeriodo = OPCOES_TIPO_PERIODO.map((op) =>
    op.value === "personalizado" && dataInicio && dataFim
      ? { ...op, label: `${dataInicio} até ${dataFim}` }
      : op
  );

  const colunas = [
    {
      key: "codigo",
      label: "Senha",
      render: (senha) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-primary tabular-nums">
            {formatarSenha(senha.codigo)}
          </span>
          {senha.prioritaria && (
            <Badge variant="warning" size="sm">
              Prioritária
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "aluno",
      label: "Aluno",
      render: (senha) => (
        <span className="font-medium text-text-primary">
          {senha.aluno?.nome}
        </span>
      ),
    },
    {
      key: "curso",
      label: "Curso",
      render: (senha) => (
        <span className="text-text-secondary capitalize">
          {senha.curso?.nome}
          {senha.curso?.periodo ? ` • ${senha.curso.periodo}` : ""}
        </span>
      ),
    },
    {
      key: "status",
      label: "Situação",
      render: (senha) =>
        senha.status === "finalizada" ? (
          <Badge variant="success" dot>
            Finalizada
          </Badge>
        ) : (
          <Badge variant="danger" dot>
            Cancelada
          </Badge>
        ),
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (senha) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSenhaSelecionada(senha)}
          className="text-xs"
        >
          Ver detalhes
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        {total} {total === 1 ? "senha encontrada" : "senhas encontradas"}.
      </p>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 min-w-60 max-w-md">
            <Input
              value={busca}
              onChange={handleBuscaChange}
              placeholder="Pesquisar por senha ou aluno..."
              icon={<FiIcons.FiSearch />}
              size="md"
            />
          </div>

          <div className="w-full sm:w-72 relative">
            <Select
              size="md"
              value={tipoPeriodo}
              onChange={handleTipoPeriodoChange}
              options={opcoesPeriodo}
              placeholder={null}
            />

            {popoverAberto && (
              <div
                ref={popoverRef}
                className="absolute left-0 top-full mt-2 z-30 w-72 p-4 bg-surface rounded-xl border border-border shadow-xl space-y-3"
              >
                <h5 className="text-xs font-semibold text-text-primary">
                  Intervalo personalizado
                </h5>

                <div className="space-y-2">
                  <Input
                    type="date"
                    label="Data Inicial"
                    size="sm"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                  <Input
                    type="date"
                    label="Data Final"
                    size="sm"
                    value={dataFim}
                    onChange={(e) => {
                      setDataFim(e.target.value);
                      if (e.target.value) setPopoverAberto(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <TableFiltro
          options={OPCOES_STATUS}
          value={status}
          onChange={handleStatusChange}
          ariaLabel="Situação da senha"
        />
      </div>

      <DataTable
        columns={colunas}
        data={senhas}
        getRowKey={(senha) => senha.id}
        emptyMessage="Nenhuma senha encontrada para os filtros selecionados."
        alturaMinima="380px"
        pagina={pagina}
        limite={7}
        total={total}
        onPaginaChange={setPagina}
      />

      <SenhaModal
        aberto={Boolean(senhaSelecionada)}
        senha={senhaSelecionada}
        onFechar={() => setSenhaSelecionada(null)}
        onAtualizar={recarregar}
      />
    </div>
  );
};

export default SecaoAuditoria;
