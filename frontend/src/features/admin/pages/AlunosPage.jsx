import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import TableFiltro from "../../../components/ui/TableFiltro";
import TableMenuActions from "../../../components/ui/TableMenuActions";

import ImportarAlunosModal from "../components/alunos/importacao/ImportarAlunosModal";

import * as alunoService from "../services/alunoService";
import { useAlunos } from "../hooks/useAlunos";
import { useCursos } from "../hooks/useCursos";

const OPCOES_STATUS_ALUNO = [
  { valor: "ATIVO", label: "Ativos" },
  { valor: "CANDIDATO", label: "Candidatos" },
  { valor: "ARQUIVADO", label: "Arquivados" },
];

const AlunosPage = () => {
  const [filtros, setFiltros] = React.useState({
    busca: "",
    cursoId: "",
    cidade: "",
    status: "ATIVO",
  });
  const [pagina, setPagina] = React.useState(1);
  const [modalAtivo, setModalAtivo] = React.useState(null);
  const [cidades, setCidades] = React.useState([]);

  const alterarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  };

  const {
    alunos,
    total,
    carregando,
    recarregar: recarregarAlunos,
  } = useAlunos({
    busca: filtros.busca,
    cursoId: filtros.cursoId,
    cidade: filtros.cidade,
    status: filtros.status,
    pagina,
    limite: 6,
  });

  const { cursos } = useCursos({ arquivado: false });

  React.useEffect(() => {
    const carregarCidades = async () => {
      try {
        const res = await alunoService.listarCidades();
        setCidades(res?.cidades ?? []);
      } catch {
        setCidades([]);
      }
    };
    carregarCidades();
  }, []);

  const handleAtualizarStatusAluno = async (alunoId, novoStatus) => {
    try {
      await alunoService.atualizarAluno(alunoId, { status: novoStatus });
      recarregarAlunos();
    } catch {
      // Erro já exibido pelo Toast do apiClient
    }
  };

  const renderBadgeStatusMatricula = (statusMatricula) => {
    if (statusMatricula === "ATIVA") {
      return (
        <Badge variant="success" icon={<FiIcons.FiCheck size={12} />}>
          Ativa
        </Badge>
      );
    }

    if (statusMatricula === "PENDENTE") {
      return (
        <Badge variant="warning" icon={<FiIcons.FiClock size={12} />}>
          Pendente
        </Badge>
      );
    }

    return <span className="text-xs text-text-secondary">—</span>;
  };

  const opcoesCursos = cursos.map((curso) => ({
    value: String(curso.id),
    label: curso.nome,
  }));

  const opcoesCidades = cidades.map((c) => ({
    value: c,
    label: c,
  }));

  const colunas = [
    {
      key: "nome",
      label: "Nome do Aluno",
      render: (aluno) => (
        <p
          className="max-w-50 truncate font-semibold text-text-primary"
          title={aluno.nome}
        >
          {aluno.nome}
        </p>
      ),
    },
    {
      key: "curso",
      label: "Curso",
      render: (aluno) => (
        <div className="max-w-55">
          <p
            className="truncate font-medium text-text-primary"
            title={aluno.curso || ""}
          >
            {aluno.curso || "—"}
          </p>
          {aluno.periodo && (
            <p className="text-xs capitalize text-text-secondary">
              Período: {aluno.periodo.toLowerCase()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "classificacao",
      label: "Classificação",
      render: (aluno) =>
        aluno.classificacao ? (
          <span className="text-center font-semibold text-text-primary">
            {aluno.classificacao}º
          </span>
        ) : (
          <span className="text-text-secondary">X</span>
        ),
    },
    {
      key: "cidade",
      label: "Cidade",
      render: (aluno) => (
        <span
          className="block max-w-37.5 truncate text-text-primary"
          title={aluno.cidade || ""}
        >
          {aluno.cidade || "—"}
        </span>
      ),
    },
    {
      key: "statusMatricula",
      label: "Situação da Matrícula",
      render: (aluno) => renderBadgeStatusMatricula(aluno.statusMatricula),
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (aluno) => (
        <TableMenuActions
          labelAria={`Ações do aluno ${aluno.nome}`}
          itens={[
            aluno.status === "CANDIDATO" && {
              label: "Ativar Aluno",
              icone: FiIcons.FiCheckCircle,
              onClick: () => handleAtualizarStatusAluno(aluno.id, "ATIVO"),
            },
            aluno.status === "ATIVO" && {
              label: "Arquivar Aluno",
              icone: FiIcons.FiArchive,
              onClick: () => handleAtualizarStatusAluno(aluno.id, "ARQUIVADO"),
              variante: "danger",
            },
            aluno.status === "ARQUIVADO" && {
              label: "Reativar Aluno",
              icone: FiIcons.FiRotateCcw,
              onClick: () => handleAtualizarStatusAluno(aluno.id, "ATIVO"),
              variante: "success",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-text-secondary">
            {(() => {
              const labels = {
                ATIVO: "ativo",
                CANDIDATO: "candidato",
                ARQUIVADO: "arquivado",
              };
              const labelAtual = labels[filtros.status] || "aluno";
              const s = total === 1 ? "" : "s";

              return `${total} aluno${s} ${labelAtual}${s} encontrado${s}`;
            })()}
          </p>
        </div>

        <Button
          leftIcon={<FiIcons.FiUploadCloud size={18} />}
          className="w-full sm:w-auto"
          onClick={() => setModalAtivo({ tipo: "importacao" })}
        >
          Importar lista de classificação
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={filtros.busca}
            onChange={(e) => alterarFiltro("busca", e.target.value)}
            placeholder="Pesquisar por nome do aluno..."
            icon={<FiIcons.FiSearch />}
            size="md"
            className="w-full sm:max-w-md"
          />

          <div className="w-full sm:w-64">
            <Select
              value={filtros.cursoId}
              onChange={(e) => alterarFiltro("cursoId", e.target.value)}
              placeholder="Todos os cursos"
              options={opcoesCursos}
              size="md"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={filtros.cidade}
              onChange={(e) => alterarFiltro("cidade", e.target.value)}
              placeholder="Todas as cidades"
              options={opcoesCidades}
              size="md"
            />
          </div>
        </div>

        <TableFiltro
          options={OPCOES_STATUS_ALUNO}
          value={filtros.status}
          onChange={(valor) => alterarFiltro("status", valor)}
          ariaLabel="Situação dos alunos"
        />
      </div>

      <DataTable
        columns={colunas}
        data={carregando ? [] : alunos}
        getRowKey={(aluno) => aluno.id}
        emptyMessage={
          carregando
            ? "Carregando alunos..."
            : "Nenhum aluno encontrado para os filtros selecionados."
        }
        alturaMinima="380px"
        pagina={pagina}
        limite={6}
        total={total}
        onPaginaChange={setPagina}
      />

      <ImportarAlunosModal
        aberto={modalAtivo?.tipo === "importacao"}
        onFechar={() => setModalAtivo(null)}
        onSucesso={() => {
          setModalAtivo(null);
          alterarFiltro("status", "CANDIDATO");
          recarregarAlunos();
        }}
      />
    </section>
  );
};

export default AlunosPage;

