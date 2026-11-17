import * as React from "react";
import { FiSearch } from "react-icons/fi";
import Alert from "../../../../../components/ui/Alert";
import DataTable from "../../../../../components/ui/DataTable";
import Input from "../../../../../components/ui/Input";
import Button from "../../../../../components/ui/Button";
import Badge from "../../../../../components/ui/Badge";
import TableFiltro from "../../../../../components/ui/TableFiltro";
import FiltroPeriodo from "../../../../../components/ui/FiltroPeriodo";
import SenhaModal from "../SenhaModal";
import { useAuditoria } from "../../../hooks/postos/useAuditoria";
import { formatarSenha } from "../../../../../utils/formatters";

import { OPCOES_STATUS } from "../../../constants/postos";

const SecaoAuditoria = () => {
  const [busca, setBusca] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [tipoPeriodo, setTipoPeriodo] = React.useState("HOJE");
  const [dataInicio, setDataInicio] = React.useState("");
  const [dataFim, setDataFim] = React.useState("");
  const [pagina, setPagina] = React.useState(1);

  const [senhaSelecionada, setSenhaSelecionada] = React.useState(null);

  const { senhas, total, carregando, erro, recarregar } = useAuditoria({
    busca,
    status: status || undefined,
    tipoPeriodo,
    dataInicio: tipoPeriodo === "PERSONALIZADO" ? dataInicio : undefined,
    dataFim: tipoPeriodo === "PERSONALIZADO" ? dataFim : undefined,
    pagina,
    limite: 7,
  });

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
    setPagina(1);
  };

  const handleTipoPeriodoChange = (novoPeriodo) => {
    setTipoPeriodo(novoPeriodo);
    setPagina(1);
  };

  const handleDataInicioChange = (novaData) => {
    setDataInicio(novaData);
    setPagina(1);
  };

  const handleDataFimChange = (novaData) => {
    setDataFim(novaData);
    setPagina(1);
  };

  const handleStatusChange = (novoStatus) => {
    setStatus(novoStatus);
    setPagina(1);
  };

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

      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              value={busca}
              onChange={handleBuscaChange}
              placeholder="Pesquisar por senha ou aluno..."
              icon={<FiSearch />}
              size="md"
            />
          </div>

          <TableFiltro
            options={OPCOES_STATUS}
            value={status}
            onChange={handleStatusChange}
            ariaLabel="Situação da senha"
          />
        </div>

        <FiltroPeriodo
          incluirTodo={false}
          periodo={tipoPeriodo}
          dataInicio={dataInicio}
          dataFim={dataFim}
          onPeriodoChange={handleTipoPeriodoChange}
          onDataInicioChange={handleDataInicioChange}
          onDataFimChange={handleDataFimChange}
          ariaLabel="Período da auditoria"
        />
      </div>

      {erro && <Alert type="error" message={erro} />}

      <DataTable
        columns={colunas}
        data={senhas}
        carregando={carregando}
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
