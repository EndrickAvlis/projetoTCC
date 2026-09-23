import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/button";
import DataTable from "../../../components/ui/DataTable";

import AlunosFiltros from "../components/alunos/AlunosFiltros";
import ImportarAlunosModal from "../components/alunos/importacao/ImportarAlunosModal";

import { useAlunos } from "../hooks/useAlunos";
import { useCursos } from "../hooks/useCursos";

const AlunosPage = () => {
  const [busca, setBusca] = React.useState("");
  const [cursoId, setCursoId] = React.useState("");
  const [status, setStatus] = React.useState("ATIVO");
  const [pagina, setPagina] = React.useState(1);
  const [modalImportacaoAberto, setModalImportacaoAberto] = React.useState(false);

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
    status,
    pagina,
    limite: 10,
  });

  const { cursos } = useCursos({ arquivado: false });

  const handleAlterarBusca = (novaBusca) => {
    setBusca(novaBusca);
    setPagina(1);
  };

  const handleAlterarCurso = (novoCursoId) => {
    setCursoId(novoCursoId);
    setPagina(1);
  };

  const handleAlterarStatus = (novoStatus) => {
    setStatus(novoStatus);
    setPagina(1);
  };

  const renderBadgeStatusAluno = (statusAluno) => {
    if (statusAluno === "ATIVO") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-status-success-bg px-2.5 py-0.5 text-xs font-semibold text-status-success border border-status-success/30">
          <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
          Ativo
        </span>
      );
    }

    if (statusAluno === "CANDIDATO") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Candidato
        </span>
      );
    }

    if (statusAluno === "ARQUIVADO") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-text-secondary border border-border">
          <span className="h-1.5 w-1.5 rounded-full bg-text-secondary" />
          Arquivado
        </span>
      );
    }

    return null;
  };

  const renderBadgeStatusMatricula = (statusMatricula) => {
    if (statusMatricula === "ATIVA") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-status-success-bg px-2 py-0.5 text-xs font-medium text-status-success border border-status-success/30">
          <FiIcons.FiCheck size={12} />
          Ativa
        </span>
      );
    }

    if (statusMatricula === "PENDENTE") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-status-warning-bg px-2 py-0.5 text-xs font-medium text-status-warning border border-status-warning/30">
          <FiIcons.FiClock size={12} />
          Pendente
        </span>
      );
    }

    return <span className="text-text-secondary text-xs">—</span>;
  };

  const colunas = [
    {
      key: "nomeAluno",
      label: "Nome do Aluno",
      render: (aluno) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-text-primary">{aluno.nomeAluno}</p>
          <p className="font-mono text-xs text-text-secondary">
            Inscrição:{" "}
            <span className="text-text-primary">{aluno.numeroInscricao}</span>
          </p>
        </div>
      ),
    },
    {
      key: "curso",
      label: "Curso",
      render: (aluno) => (
        <div>
          <p className="font-medium text-text-primary">
            {aluno.cursoAluno?.curso?.nomeCurso}
          </p>
          {aluno.cursoAluno?.periodo && (
            <p className="text-xs text-text-secondary capitalize">
              Período: {aluno.cursoAluno.periodo.toLowerCase()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "classificacao",
      label: "Classificação",
      render: (aluno) =>
        aluno.cursoAluno?.classificacao ? (
          <span className="font-semibold text-text-primary">
            {aluno.cursoAluno.classificacao}º
          </span>
        ) : (
          <span className="text-text-secondary">—</span>
        ),
    },
    {
      key: "cidadeAluno",
      label: "Cidade",
      render: (aluno) => (
        <span className="text-text-primary">{aluno.cidadeAluno || "—"}</span>
      ),
    },
    {
      key: "statusAluno",
      label: "Situação do Aluno",
      render: (aluno) => renderBadgeStatusAluno(aluno.statusAluno),
    },
    {
      key: "statusMatricula",
      label: "Situação da Matrícula",
      render: (aluno) =>
        renderBadgeStatusMatricula(aluno.cursoAluno?.statusMatricula),
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
        cursoId={cursoId}
        onAlterarCurso={handleAlterarCurso}
        status={status}
        onAlterarStatus={handleAlterarStatus}
        cursos={cursos}
      />

      {erro && <Alert type="error" message={erro} />}

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
          getRowKey={(aluno) => aluno.idAluno}
          emptyMessage="Nenhum aluno encontrado para os filtros selecionados."
          pagina={pagina}
          limite={10}
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
