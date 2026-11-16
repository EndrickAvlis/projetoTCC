import * as React from "react";
import {
  FiCheck,
  FiChevronDown,
  FiClock,
  FiCheckCircle,
  FiArchive,
  FiRotateCcw,
  FiUploadCloud,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import ConfirmarModal from "../../../components/ui/ConfirmarModal";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import TableFiltro from "../../../components/ui/TableFiltro";
import TableMenuActions from "../../../components/ui/TableMenuActions";
import ArquivarCandidatosModal from "../components/alunos/ArquivarCandidatosModal";
import ImportarAlunosModal from "../components/alunos/importacao/ImportarAlunosModal";

import * as alunoService from "../services/alunoService";
import { useAlunos } from "../hooks/useAlunos";
import { useCursos } from "../hooks/useCursos";
import { useToast } from "../../../context/toastContext";
import { formatarPeriodo } from "../../../utils/formatters";

const OPCOES_STATUS_ALUNO = [
  { valor: "ATIVO", label: "Ativos" },
  { valor: "CANDIDATO", label: "Candidatos" },
  { valor: "ARQUIVADO", label: "Arquivados" },
];

const ROTULO_STATUS_ALUNO = {
  ATIVO: "ativo",
  CANDIDATO: "candidato",
  ARQUIVADO: "arquivado",
};

const FILTROS_INICIAIS = {
  busca: "",
  cursoId: "",
  cidade: "",
  status: "ATIVO",
};

const ITENS_POR_PAGINA = 8;

const renderBadgeStatusMatricula = (statusMatricula) => {
  if (statusMatricula === "ATIVA") {
    return (
      <Badge variant="success" icon={<FiCheck size={12} />}>
        Ativa
      </Badge>
    );
  }

  if (statusMatricula === "PENDENTE") {
    return (
      <Badge variant="warning" icon={<FiClock size={12} />}>
        Pendente
      </Badge>
    );
  }

  return <span className="text-xs text-text-secondary">—</span>;
};

const obterConfirmacao = (modalAtivo, toast) => {
  const aluno = modalAtivo?.aluno;

  if (modalAtivo?.tipo === "ativar" && aluno) {
    return {
      titulo: "Ativar aluno",
      mensagem: `Deseja ativar o aluno "${aluno.nome}" manualmente sem concluir o fluxo de matrícula?`,
      textoConfirmar: "Ativar",
      variante: "success",
      sucesso: "Aluno ativado com sucesso.",
      mudouLista: true,
      acao: () => alunoService.atualizarAluno(aluno.id, { status: "ATIVO" }),
    };
  }

  if (modalAtivo?.tipo === "arquivar" && aluno) {
    return {
      titulo: "Arquivar aluno",
      mensagem: `Deseja arquivar o aluno "${aluno.nome}"? Ele deixará de aparecer nas buscas de atendimento.`,
      textoConfirmar: "Arquivar",
      variante: "danger",
      sucesso: "Aluno arquivado com sucesso.",
      mudouLista: true,
      acao: () =>
        alunoService.atualizarAluno(aluno.id, { status: "ARQUIVADO" }),
    };
  }

  if (modalAtivo?.tipo === "reativar" && aluno) {
    const novoStatus =
      aluno.cursos?.some((c) => c.statusMatricula === "ATIVA") ||
      aluno.statusMatricula === "ATIVA"
        ? "ATIVO"
        : "CANDIDATO";

    return {
      titulo: "Reativar aluno",
      mensagem: `Deseja reativar o aluno "${aluno.nome}" como ${novoStatus === "ATIVO" ? "ativo" : "candidato"}?`,
      textoConfirmar: "Reativar",
      variante: "success",
      sucesso: "Aluno reativado com sucesso.",
      mudouLista: true,
      acao: () => alunoService.atualizarAluno(aluno.id, { status: novoStatus }),
    };
  }

  if (modalAtivo?.tipo === "excluirAluno" && aluno) {
    return {
      titulo: "Excluir aluno",
      mensagem: `Deseja excluir permanentemente o aluno "${aluno.nome}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: "Excluir",
      variante: "danger",
      sucesso: "Aluno excluído com sucesso.",
      mudouLista: true,
      atualizarCidades: true,
      acao: () => alunoService.excluirAluno(aluno.id),
    };
  }

  if (modalAtivo?.tipo === "excluirArquivados") {
    return {
      titulo: "Excluir arquivados sem vínculos",
      mensagem:
        "Todos os alunos arquivados que não possuem compras, senhas ou histórico de atendimento serão excluídos permanentemente. Deseja continuar?",
      textoConfirmar: "Excluir elegíveis",
      variante: "danger",
      resetarPagina: true,
      atualizarCidades: true,
      acao: () => alunoService.excluirAlunos(),
      notificar: (res) => {
        if (res.excluidos === 0) {
          toast.info("Nenhum aluno arquivado sem vínculos para excluir.");
          return;
        }
        const complemento =
          res.mantidos > 0
            ? ` ${res.mantidos} mantido${res.mantidos === 1 ? "" : "s"} por possuir vínculos.`
            : "";
        toast.sucesso(
          `${res.excluidos} aluno${res.excluidos === 1 ? "" : "s"} excluído${res.excluidos === 1 ? "" : "s"}.${complemento}`,
        );
      },
    };
  }

  return null;
};

const AlunosPage = () => {
  const toast = useToast();
  const [filtros, setFiltros] = React.useState(FILTROS_INICIAIS);
  const [pagina, setPagina] = React.useState(1);
  const [modalAtivo, setModalAtivo] = React.useState(null);
  const [processandoModal, setProcessandoModal] = React.useState(false);
  const [alunoExpandido, setAlunoExpandido] = React.useState(null);

  const {
    alunos,
    total,
    cidades,
    carregando,
    erro,
    recarregar: recarregarAlunos,
    recarregarCidades,
  } = useAlunos({
    busca: filtros.busca,
    cursoId: filtros.cursoId,
    cidade: filtros.cidade,
    status: filtros.status,
    pagina,
    limite: ITENS_POR_PAGINA,
  });

  const { cursos } = useCursos({ arquivado: "todos" });

  const opcoesCursos = React.useMemo(
    () =>
      [...cursos]
        .sort((a, b) => {
          if (Boolean(a.arquivado) !== Boolean(b.arquivado)) {
            return a.arquivado ? 1 : -1;
          }
          return a.nome.localeCompare(b.nome, "pt-BR");
        })
        .map((curso) => ({
          value: String(curso.id),
          label: curso.arquivado ? `${curso.nome} (Arquivado)` : curso.nome,
        })),
    [cursos],
  );

  const opcoesCidades = React.useMemo(() => {
    const lista =
      filtros.cidade && !cidades.includes(filtros.cidade)
        ? [filtros.cidade, ...cidades]
        : cidades;
    return lista.map((cidade) => ({ value: cidade, label: cidade }));
  }, [cidades, filtros.cidade]);

  const alterarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
    setAlunoExpandido(null);
  };

  const fecharModal = () => {
    if (!processandoModal) {
      setModalAtivo(null);
    }
  };

  const atualizarLista = async ({
    resetarPagina = false,
    mudouLista = false,
    atualizarCidades = false,
  } = {}) => {
    if (atualizarCidades) {
      void recarregarCidades();
    }

    if (resetarPagina && pagina !== 1) {
      setPagina(1);
      return;
    }

    if (mudouLista && alunos.length === 1 && pagina > 1) {
      setPagina(pagina - 1);
      return;
    }

    await recarregarAlunos({ silencioso: true });
  };

  const confirmacaoAtiva = obterConfirmacao(modalAtivo, toast);

  const handleConfirmarAcao = async () => {
    if (!confirmacaoAtiva) return;

    setProcessandoModal(true);
    try {
      const res = await confirmacaoAtiva.acao();
      if (confirmacaoAtiva.notificar) {
        confirmacaoAtiva.notificar(res);
      } else {
        toast.sucesso(confirmacaoAtiva.sucesso);
      }
      setModalAtivo(null);
      await atualizarLista(confirmacaoAtiva);
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setProcessandoModal(false);
    }
  };

  const handleArquivarCandidatos = async (payload) => {
    setProcessandoModal(true);
    try {
      const res = await alunoService.arquivarCandidatos(payload);
      if (res.arquivados === 0) {
        toast.info("Nenhum candidato encontrado para arquivar.");
      } else {
        toast.sucesso(
          `${res.arquivados} candidato${res.arquivados === 1 ? "" : "s"} arquivado${res.arquivados === 1 ? "" : "s"}.`,
        );
      }
      setModalAtivo(null);
      await atualizarLista({ resetarPagina: true });
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setProcessandoModal(false);
    }
  };

  const renderColunaCursos = (
    aluno,
    renderItem,
    { mostrarBotao = false } = {},
  ) => {
    const todos = aluno.cursos ?? [];
    if (todos.length === 0) {
      return <span className="text-text-secondary">—</span>;
    }

    const expandido = alunoExpandido === aluno.id;
    const visiveis = expandido ? todos : todos.slice(0, 1);
    const restantes = todos.length - 1;

    return (
      <div className={mostrarBotao ? "max-w-55 space-y-2" : "space-y-2"}>
        {visiveis.map((cursoItem) => (
          <div
            key={cursoItem.id}
            className="flex min-h-9 flex-col items-start justify-center"
          >
            {renderItem(cursoItem)}
          </div>
        ))}

        {mostrarBotao && restantes > 0 && (
          <button
            type="button"
            onClick={() =>
              setAlunoExpandido((atual) =>
                atual === aluno.id ? null : aluno.id,
              )
            }
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
            aria-expanded={expandido}
          >
            {expandido
              ? "Ver menos"
              : `Ver mais ${restantes} curso${restantes === 1 ? "" : "s"}`}
            <FiChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                expandido ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>
    );
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
      cellClassName: "align-top",
      render: (aluno) =>
        renderColunaCursos(
          aluno,
          (cursoItem) => (
            <>
              <p
                className="w-full truncate font-medium text-text-primary"
                title={cursoItem.nome || ""}
              >
                {cursoItem.nome || "—"}
              </p>
              {cursoItem.periodo && (
                <p className="text-xs text-text-secondary">
                  Período: {formatarPeriodo(cursoItem.periodo)}
                </p>
              )}
            </>
          ),
          { mostrarBotao: true },
        ),
    },
    {
      key: "classificacao",
      label: "Classificação",
      cellClassName: "align-top",
      render: (aluno) =>
        renderColunaCursos(aluno, (cursoItem) =>
          cursoItem.classificacao ? (
            <span className="font-semibold text-text-primary">
              {cursoItem.classificacao}º
            </span>
          ) : (
            <span className="text-text-secondary">—</span>
          ),
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
      cellClassName: "align-top",
      render: (aluno) =>
        renderColunaCursos(aluno, (cursoItem) =>
          renderBadgeStatusMatricula(cursoItem.statusMatricula),
        ),
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (aluno) => (
        <TableMenuActions
          label={`Ações do aluno ${aluno.nome}`}
          itens={[
            aluno.status === "CANDIDATO" && {
              label: "Ativar aluno",
              icone: FiCheckCircle,
              onClick: () => setModalAtivo({ tipo: "ativar", aluno }),
            },
            (aluno.status === "ATIVO" || aluno.status === "CANDIDATO") && {
              label: "Arquivar aluno",
              icone: FiArchive,
              onClick: () => setModalAtivo({ tipo: "arquivar", aluno }),
              variante: "danger",
            },
            aluno.status === "ARQUIVADO" && {
              label: "Reativar aluno",
              icone: FiRotateCcw,
              onClick: () => setModalAtivo({ tipo: "reativar", aluno }),
              variante: "success",
            },
            aluno.status === "ARQUIVADO" &&
              !aluno.possuiVinculos && {
                label: "Excluir aluno",
                icone: FiTrash2,
                onClick: () => setModalAtivo({ tipo: "excluirAluno", aluno }),
                variante: "danger",
              },
          ]}
        />
      ),
    },
  ];

  const rotuloStatus = ROTULO_STATUS_ALUNO[filtros.status] ?? "ativo";

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-text-secondary">
          {total} {total === 1 ? "aluno" : "alunos"} {rotuloStatus}
          {total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {filtros.status === "CANDIDATO" && (
            <Button
              variant="danger"
              leftIcon={<FiArchive size={18} />}
              className="w-full sm:w-auto"
              disabled={total === 0 || carregando}
              onClick={() => setModalAtivo({ tipo: "arquivarCandidatos" })}
            >
              Arquivar candidatos
            </Button>
          )}

          {filtros.status === "ARQUIVADO" && (
            <Button
              variant="danger"
              leftIcon={<FiTrash2 size={18} />}
              className="w-full sm:w-auto"
              disabled={total === 0 || carregando}
              onClick={() => setModalAtivo({ tipo: "excluirArquivados" })}
            >
              Excluir arquivados
            </Button>
          )}

          <Button
            leftIcon={<FiUploadCloud size={18} />}
            className="w-full sm:w-auto"
            onClick={() => setModalAtivo({ tipo: "importacao" })}
          >
            Importar lista de classificação
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={filtros.busca}
            onChange={(e) => alterarFiltro("busca", e.target.value)}
            placeholder="Pesquisar por nome do aluno..."
            icon={<FiSearch />}
            size="md"
            className="w-full sm:max-w-md"
          />

          <div className="w-full sm:w-64">
            <Select
              aria-label="Filtrar por curso"
              value={filtros.cursoId}
              onChange={(e) => alterarFiltro("cursoId", e.target.value)}
              placeholder="Todos os cursos"
              options={opcoesCursos}
              size="md"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              aria-label="Filtrar por cidade"
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

      {erro && <Alert type="error" message={erro} />}

      <DataTable
        columns={colunas}
        data={alunos}
        carregando={carregando}
        getRowKey={(aluno) => aluno.id}
        emptyMessage="Nenhum aluno encontrado para os filtros selecionados."
        alturaMinima="380px"
        pagina={pagina}
        limite={ITENS_POR_PAGINA}
        total={total}
        onPaginaChange={(novaPagina) => {
          setPagina(novaPagina);
          setAlunoExpandido(null);
        }}
      />

      <ImportarAlunosModal
        aberto={modalAtivo?.tipo === "importacao"}
        onFechar={() => setModalAtivo(null)}
        onSucesso={() => {
          const jaNaListaCandidatos =
            !filtros.busca &&
            !filtros.cursoId &&
            !filtros.cidade &&
            filtros.status === "CANDIDATO" &&
            pagina === 1;

          setFiltros({ ...FILTROS_INICIAIS, status: "CANDIDATO" });
          setPagina(1);
          setAlunoExpandido(null);
          void recarregarCidades();

          if (jaNaListaCandidatos) {
            void recarregarAlunos({ silencioso: true });
          }
        }}
      />

      <ArquivarCandidatosModal
        aberto={modalAtivo?.tipo === "arquivarCandidatos"}
        onFechar={fecharModal}
        onConfirmar={handleArquivarCandidatos}
        salvando={processandoModal}
      />

      <ConfirmarModal
        aberto={Boolean(confirmacaoAtiva)}
        onFechar={fecharModal}
        onConfirmar={handleConfirmarAcao}
        titulo={confirmacaoAtiva?.titulo}
        mensagem={confirmacaoAtiva?.mensagem}
        textoConfirmar={confirmacaoAtiva?.textoConfirmar}
        variante={confirmacaoAtiva?.variante}
        salvando={processandoModal}
      />
    </section>
  );
};

export default AlunosPage;
