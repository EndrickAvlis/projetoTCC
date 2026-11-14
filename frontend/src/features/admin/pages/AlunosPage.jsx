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
import ImportarAlunosModal from "../components/alunos/importacao/ImportarAlunosModal";

import * as alunoService from "../services/alunoService";
import { useAlunos } from "../hooks/useAlunos";
import { useCursos } from "../hooks/useCursos";
import { useToast } from "../../../context/toastContext";

const OPCOES_STATUS_ALUNO = [
  { valor: "ATIVO", label: "Ativos" },
  { valor: "CANDIDATO", label: "Candidatos" },
  { valor: "ARQUIVADO", label: "Arquivados" },
];

const OPCOES_SEMESTRE = [
  { value: "1", label: "1º Semestre" },
  { value: "2", label: "2º Semestre" },
];

const CONFIG_STATUS_ALUNO = {
  ativar: {
    titulo: "Ativar aluno",
    textoConfirmar: "Ativar",
    variante: "success",
    sucesso: "Aluno ativado com sucesso.",
    mensagem: (aluno) =>
      `Deseja ativar o aluno "${aluno.nome}" manualmente sem concluir o fluxo de matrícula?`,
  },
  arquivar: {
    titulo: "Arquivar aluno",
    textoConfirmar: "Arquivar",
    variante: "danger",
    sucesso: "Aluno arquivado com sucesso.",
    mensagem: (aluno) =>
      `Deseja arquivar o aluno "${aluno.nome}"? Ele deixará de aparecer nas buscas de atendimento.`,
  },
  reativar: {
    titulo: "Reativar aluno",
    textoConfirmar: "Reativar",
    variante: "success",
    sucesso: "Aluno reativado com sucesso.",
    mensagem: (aluno, novoStatus) =>
      `Deseja reativar o aluno "${aluno.nome}" como ${novoStatus === "ATIVO" ? "ativo" : "candidato"}?`,
  },
};

const ITENS_POR_PAGINA = 8;

const AlunosPage = () => {
  const toast = useToast();
  const [filtros, setFiltros] = React.useState({
    busca: "",
    cursoId: "",
    cidade: "",
    status: "ATIVO",
  });
  const [pagina, setPagina] = React.useState(1);
  const [modalAtivo, setModalAtivo] = React.useState(null);
  const [cidades, setCidades] = React.useState([]);
  const [escopoArquivamento, setEscopoArquivamento] = React.useState("todos");
  const [anoProcesso, setAnoProcesso] = React.useState(
    new Date().getFullYear(),
  );
  const [semestreProcesso, setSemestreProcesso] = React.useState(
    new Date().getMonth() < 6 ? "1" : "2",
  );
  const [processandoModal, setProcessandoModal] = React.useState(false);
  const [alunoExpandido, setAlunoExpandido] = React.useState(null);

  const alterarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  };

  const alternarCursos = (alunoId) => {
    setAlunoExpandido((alunoAtual) =>
      alunoAtual === alunoId ? null : alunoId,
    );
  };

  const obterCursosVisiveis = (aluno) => {
    const todos =
      aluno.cursos?.length > 0
        ? aluno.cursos
        : aluno.curso
          ? [
              {
                id: aluno.cursoId ?? "principal",
                nome: aluno.curso,
                periodo: aluno.periodo,
                classificacao: aluno.classificacao,
                statusMatricula: aluno.statusMatricula,
              },
            ]
          : [];
    const expandido = alunoExpandido === aluno.id;
    return {
      todos,
      visiveis: expandido ? todos : todos.slice(0, 1),
      restantes: todos.slice(1),
      expandido,
    };
  };

  const {
    alunos,
    total,
    carregando,
    erro,
    recarregar: recarregarAlunos,
  } = useAlunos({
    busca: filtros.busca,
    cursoId: filtros.cursoId,
    cidade: filtros.cidade,
    status: filtros.status,
    pagina,
    limite: ITENS_POR_PAGINA,
  });

  const { cursos } = useCursos({ arquivado: false });

  const carregarCidades = React.useCallback(async () => {
    try {
      const res = await alunoService.listarCidades();
      setCidades(res?.cidades ?? []);
    } catch {
      setCidades([]);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(carregarCidades);
  }, [carregarCidades]);

  const fecharModal = () => {
    if (!processandoModal) {
      setModalAtivo(null);
    }
  };

  const handleAtualizarStatusAluno = async () => {
    if (!modalAtivo?.aluno || !modalAtivo?.novoStatus) return;

    setProcessandoModal(true);
    try {
      await alunoService.atualizarAluno(modalAtivo.aluno.id, {
        status: modalAtivo.novoStatus,
      });
      toast.sucesso(CONFIG_STATUS_ALUNO[modalAtivo.acao].sucesso);
      setModalAtivo(null);
      recarregarAlunos();
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setProcessandoModal(false);
    }
  };

  const handleArquivarCandidatos = async () => {
    const porProcesso = escopoArquivamento === "processo";
    if (
      porProcesso &&
      (!anoProcesso || Number(anoProcesso) < 2000 || Number(anoProcesso) > 2100)
    ) {
      toast.erro("Informe um ano válido para o processo seletivo.");
      return;
    }

    setProcessandoModal(true);
    try {
      const payload = porProcesso
        ? {
            anoProcesso: Number(anoProcesso),
            semestreProcesso: Number(semestreProcesso),
          }
        : {};
      const res = await alunoService.arquivarCandidatos(payload);
      if (res.arquivados === 0) {
        toast.info("Nenhum candidato encontrado para arquivar.");
      } else {
        toast.sucesso(
          `${res.arquivados} candidato${res.arquivados === 1 ? "" : "s"} arquivado${res.arquivados === 1 ? "" : "s"}.`,
        );
      }
      setModalAtivo(null);
      setPagina(1);
      recarregarAlunos();
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setProcessandoModal(false);
    }
  };

  const handleExcluirAluno = async () => {
    if (!modalAtivo?.aluno) return;

    setProcessandoModal(true);
    try {
      await alunoService.excluirAluno(modalAtivo.aluno.id);
      toast.sucesso("Aluno excluído com sucesso.");
      setModalAtivo(null);
      recarregarAlunos();
      carregarCidades();
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setProcessandoModal(false);
    }
  };

  const handleExcluirAlunos = async () => {
    setProcessandoModal(true);
    try {
      const res = await alunoService.excluirAlunos();
      if (res.excluidos === 0) {
        toast.info("Nenhum aluno arquivado sem vínculos para excluir.");
      } else {
        const complemento =
          res.mantidos > 0
            ? ` ${res.mantidos} mantido${res.mantidos === 1 ? "" : "s"} por possuir vínculos.`
            : "";
        toast.sucesso(
          `${res.excluidos} aluno${res.excluidos === 1 ? "" : "s"} excluído${res.excluidos === 1 ? "" : "s"}.${complemento}`,
        );
      }
      setModalAtivo(null);
      setPagina(1);
      recarregarAlunos();
      carregarCidades();
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setProcessandoModal(false);
    }
  };

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
      cellClassName: "align-top",
      render: (aluno) => {
        const { visiveis, restantes, expandido } = obterCursosVisiveis(aluno);
        if (visiveis.length === 0) {
          return <span className="text-text-secondary">—</span>;
        }

        return (
          <div className="max-w-55 space-y-2">
            {visiveis.map((cursoItem) => (
              <div
                key={cursoItem.id}
                className="flex min-h-9 flex-col justify-center"
              >
                <p
                  className="truncate font-medium text-text-primary"
                  title={cursoItem.nome || ""}
                >
                  {cursoItem.nome || "—"}
                </p>
                {cursoItem.periodo && (
                  <p className="text-xs capitalize text-text-secondary">
                    Período: {cursoItem.periodo.toLowerCase()}
                  </p>
                )}
              </div>
            ))}

            {restantes.length > 0 && (
              <button
                type="button"
                onClick={() => alternarCursos(aluno.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover cursor-pointer"
                aria-expanded={expandido}
              >
                {expandido
                  ? "Ver menos"
                  : `Ver mais ${restantes.length} curso${
                      restantes.length === 1 ? "" : "s"
                    }`}
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
      },
    },
    {
      key: "classificacao",
      label: "Classificação",
      cellClassName: "align-top",
      render: (aluno) => {
        const { visiveis } = obterCursosVisiveis(aluno);
        if (visiveis.length === 0) {
          return <span className="text-text-secondary">-</span>;
        }

        return (
          <div className="space-y-2">
            {visiveis.map((cursoItem) => (
              <div
                key={cursoItem.id}
                className="flex min-h-9 items-center"
              >
                {cursoItem.classificacao ? (
                  <span className="font-semibold text-text-primary">
                    {cursoItem.classificacao}º
                  </span>
                ) : (
                  <span className="text-text-secondary">-</span>
                )}
              </div>
            ))}
          </div>
        );
      },
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
      render: (aluno) => {
        const { visiveis } = obterCursosVisiveis(aluno);
        if (visiveis.length === 0) {
          return renderBadgeStatusMatricula(aluno.statusMatricula);
        }

        return (
          <div className="space-y-2">
            {visiveis.map((cursoItem) => (
              <div
                key={cursoItem.id}
                className="flex min-h-9 items-center"
              >
                {renderBadgeStatusMatricula(cursoItem.statusMatricula)}
              </div>
            ))}
          </div>
        );
      },
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
              label: "Ativar Aluno",
              icone: FiCheckCircle,
              onClick: () =>
                setModalAtivo({
                  tipo: "alterarStatus",
                  acao: "ativar",
                  aluno,
                  novoStatus: "ATIVO",
                }),
            },
            (aluno.status === "ATIVO" || aluno.status === "CANDIDATO") && {
              label: "Arquivar Aluno",
              icone: FiArchive,
              onClick: () =>
                setModalAtivo({
                  tipo: "alterarStatus",
                  acao: "arquivar",
                  aluno,
                  novoStatus: "ARQUIVADO",
                }),
              variante: "danger",
            },
            aluno.status === "ARQUIVADO" && {
              label: "Reativar Aluno",
              icone: FiRotateCcw,
              onClick: () =>
                setModalAtivo({
                  tipo: "alterarStatus",
                  acao: "reativar",
                  aluno,
                  novoStatus:
                    aluno.cursos?.some((c) => c.statusMatricula === "ATIVA") ||
                    aluno.statusMatricula === "ATIVA"
                      ? "ATIVO"
                      : "CANDIDATO",
                }),
              variante: "success",
            },
            aluno.status === "ARQUIVADO" &&
              !aluno.possuiVinculos && {
                label: "Excluir Aluno",
                icone: FiTrash2,
                onClick: () => setModalAtivo({ tipo: "excluirAluno", aluno }),
                variante: "danger",
              },
          ]}
        />
      ),
    },
  ];

  const obterConfirmacaoSimples = () => {
    if (modalAtivo?.tipo === "alterarStatus") {
      const cfg = CONFIG_STATUS_ALUNO[modalAtivo.acao];
      return {
        titulo: cfg.titulo,
        mensagem: cfg.mensagem(modalAtivo.aluno, modalAtivo.novoStatus),
        textoConfirmar: cfg.textoConfirmar,
        variante: cfg.variante,
        onConfirmar: handleAtualizarStatusAluno,
      };
    }

    if (modalAtivo?.tipo === "excluirArquivados") {
      return {
        titulo: "Excluir arquivados sem vínculos",
        mensagem:
          "Todos os alunos arquivados que não possuem compras, senhas ou histórico de atendimento serão excluídos permanentemente. Deseja continuar?",
        textoConfirmar: "Excluir elegíveis",
        variante: "danger",
        onConfirmar: handleExcluirAlunos,
      };
    }

    if (modalAtivo?.tipo === "excluirAluno") {
      return {
        titulo: "Excluir aluno",
        mensagem: `Deseja excluir permanentemente o aluno "${modalAtivo.aluno?.nome}"? Essa ação não pode ser desfeita.`,
        textoConfirmar: "Excluir",
        variante: "danger",
        onConfirmar: handleExcluirAluno,
      };
    }

    return null;
  };

  const confirmacaoSimples = obterConfirmacaoSimples();

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-text-secondary">
            {total} {total === 1 ? "aluno" : "alunos"}{" "}
            {filtros.status === "ATIVO"
              ? "ativo"
              : filtros.status === "CANDIDATO"
                ? "candidato"
                : "arquivado"}
            {total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {filtros.status === "CANDIDATO" && (
            <Button
              variant="danger"
              leftIcon={<FiArchive size={18} />}
              className="w-full sm:w-auto"
              onClick={() => {
                setEscopoArquivamento("todos");
                setModalAtivo({ tipo: "arquivarCandidatos" });
              }}
            >
              Arquivar candidatos
            </Button>
          )}

          {filtros.status === "ARQUIVADO" && (
            <Button
              variant="danger"
              leftIcon={<FiTrash2 size={18} />}
              className="w-full sm:w-auto"
              onClick={() => setModalAtivo({ tipo: "excluirArquivados" })}
            >
              Excluir Arquivados
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
        onPaginaChange={setPagina}
      />

      <ImportarAlunosModal
        aberto={modalAtivo?.tipo === "importacao"}
        onFechar={() => setModalAtivo(null)}
        onSucesso={() => {
          setModalAtivo(null);
          alterarFiltro("status", "CANDIDATO");
          recarregarAlunos();
          carregarCidades();
        }}
      />

      <ConfirmarModal
        aberto={modalAtivo?.tipo === "arquivarCandidatos"}
        onFechar={fecharModal}
        onConfirmar={handleArquivarCandidatos}
        titulo="Arquivar candidatos"
        textoConfirmar="Arquivar"
        salvando={processandoModal}
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Escolha se deseja arquivar todos os alunos candidatos ou apenas os
            de um processo seletivo específico.
          </p>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-text-primary">
              <input
                type="radio"
                name="escopoArquivamento"
                value="todos"
                checked={escopoArquivamento === "todos"}
                onChange={(e) => setEscopoArquivamento(e.target.value)}
                className="accent-primary"
              />
              Todos os candidatos
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-text-primary">
              <input
                type="radio"
                name="escopoArquivamento"
                value="processo"
                checked={escopoArquivamento === "processo"}
                onChange={(e) => setEscopoArquivamento(e.target.value)}
                className="accent-primary"
              />
              Apenas de um processo seletivo específico
            </label>
          </div>

          {escopoArquivamento === "processo" && (
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              <Input
                type="number"
                label="Ano do processo"
                value={anoProcesso}
                onChange={(e) => setAnoProcesso(e.target.value)}
                min={2000}
                max={2100}
                size="md"
              />

              <Select
                label="Semestre"
                value={semestreProcesso}
                onChange={(e) => setSemestreProcesso(e.target.value)}
                options={OPCOES_SEMESTRE}
                size="md"
              />
            </div>
          )}
        </div>
      </ConfirmarModal>

      <ConfirmarModal
        aberto={Boolean(confirmacaoSimples)}
        onFechar={fecharModal}
        onConfirmar={confirmacaoSimples?.onConfirmar}
        titulo={confirmacaoSimples?.titulo}
        mensagem={confirmacaoSimples?.mensagem}
        textoConfirmar={confirmacaoSimples?.textoConfirmar}
        variante={confirmacaoSimples?.variante}
        salvando={processandoModal}
      />
    </section>
  );
};

export default AlunosPage;
