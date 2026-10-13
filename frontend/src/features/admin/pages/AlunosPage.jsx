import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import TableMenuActions from "../../../components/ui/TableMenuActions";

import AlunosFiltros from "../components/alunos/AlunosFiltros";
import ImportarAlunosModal from "../components/alunos/importacao/ImportarAlunosModal";

import * as AlunosService from "../services/alunoService";
import { useAlunos } from "../hooks/useAlunos";
import { useCursos } from "../hooks/useCursos";

const AlunosPage = () => {
  const [busca, setBusca] = React.useState("");
  const [cursoId, setCursoId] = React.useState("");
  const [status, setStatus] = React.useState("ATIVO");
  const [pagina, setPagina] = React.useState(1);
  const [modalImportacaoAberto, setModalImportacaoAberto] =
    React.useState(false);
  const [cidade, setCidade] = React.useState("");
  const [cidades, setCidades] = React.useState([]);

  const {
    alunos,
    total,
    totalAtivos,
    carregando,
    erro,
    recarregar: recarregarAlunos,
  } = useAlunos({
    busca,
    cursoId,
    cidade,
    status,
    pagina,
    limite: 6,
  });

  const { cursos } = useCursos({ arquivado: false });

  React.useEffect(() => {
    const carregarCidades = async () => {
      try {
        const res = await AlunosService.listarCidadesAlunos();
        setCidades(res?.cidades ?? []);
      } catch {
        setCidades([]);
      }
    };
    carregarCidades();
  }, []);

  const handleAlterarBusca = (novaBusca) => {
    setBusca(novaBusca);
    setPagina(1);
  };

  const handleAlterarCidade = (novaCidade) => {
    setCidade(novaCidade);
    setPagina(1);
  };

  const handleAlterarCurso = (novoCursoId) => {
    setCursoId(novoCursoId);
    setPagina(1);
  };

  const handleAlterarFiltroStatus = (novoStatus) => {
    setStatus(novoStatus);
    setPagina(1);
  };

  const handleAtualizarStatusAluno = async (alunoId, novoStatus) => {
    try {
      await AlunosService.atualizarDadosAluno(alunoId, { status: novoStatus });
      recarregarAlunos();
    } catch (err) {
      alert(err.message || "Erro ao alterar situação do aluno.");
    }
  };

  const renderBadgeStatusAluno = (statusAluno) => {
    if (statusAluno === "ATIVO") return <Badge variant="success" dot>Ativo</Badge>;
    if (statusAluno === "CANDIDATO") return <Badge variant="primary" dot>Candidato</Badge>;
    if (statusAluno === "ARQUIVADO") return <Badge variant="neutral" dot>Arquivado</Badge>;
    return null;
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

    return <span className="text-text-secondary text-xs">—</span>;
  };

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
            <p className="text-xs text-text-secondary capitalize">
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
          <span className="font-semibold text-text-primary text-center">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alunos</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Consulte a lista de classificação, gerencie candidatos e acompanhe
            as matrículas.
          </p>
        </div>

        <Button
          leftIcon={<FiIcons.FiUploadCloud size={18} />}
          className="w-full sm:w-auto"
          onClick={() => setModalImportacaoAberto(true)}
        >
          Importar lista de classificação
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm max-w-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-success/10 text-status-success">
          <FiIcons.FiUsers size={24} />
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary">
            Total de alunos ativos
          </p>
          <p className="text-2xl font-bold text-text-primary">{totalAtivos}</p>
        </div>
      </div>

      <AlunosFiltros
        busca={busca}
        onAlterarBusca={handleAlterarBusca}
        cidade={cidade}
        onAlterarCidade={handleAlterarCidade}
        cidades={cidades}
        cursoId={cursoId}
        onAlterarCurso={handleAlterarCurso}
        status={status}
        onAlterarStatus={handleAlterarFiltroStatus}
        cursos={cursos}
      />

      {carregando && alunos.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-surface py-16 text-sm text-text-secondary">
          <div className="flex flex-col items-center gap-2">
            <FiIcons.FiLoader className="h-6 w-6 animate-spin text-primary" />
            <span>Carregando alunos...</span>
          </div>
        </div>
      ) : (
        <DataTable
          columns={colunas}
          data={alunos}
          getRowKey={(aluno) => aluno.id}
          emptyMessage="Nenhum aluno encontrado para os filtros selecionados."
          alturaMinima="380px"
          pagina={pagina}
          limite={6}
          total={total}
          onPaginaChange={setPagina}
        />
      )}

      <ImportarAlunosModal
        aberto={modalImportacaoAberto}
        onFechar={() => setModalImportacaoAberto(false)}
        onSucesso={() => {
          setStatus("CANDIDATO");
          setPagina(1);
          recarregarAlunos();
        }}
      />
    </section>
  );
};

export default AlunosPage;
