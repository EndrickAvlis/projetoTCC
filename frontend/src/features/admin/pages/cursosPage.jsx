import * as React from "react";
import { createPortal } from "react-dom";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";

import AdicionarCursoModal from "../components/cursos/AdicionarCursoModal";
import AdicionarPeriodoModal from "../components/cursos/AdicionarPeriodoModal";
import EditarPeriodoModal from "../components/cursos/EditarPeriodoModal";

import { useCursos } from "../hooks/useCursos";
import * as cursoService from "../services/CursosService";

const nomesPeriodos = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
};

const formatarPeriodo = (periodo) => nomesPeriodos[periodo] ?? periodo;

const PeriodoResumo = ({ periodoCurso, onEditar }) => (
  <div className="grid grid-cols-[5rem_4.5rem_6.75rem_2.25rem] items-center gap-x-3 text-sm">
    <span className="font-medium text-text-primary">
      {formatarPeriodo(periodoCurso.periodo)}
    </span>

    <span className="whitespace-nowrap text-text-secondary">
      {periodoCurso.vagasTotais} vagas
    </span>

    <span
      className={`w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${periodoCurso.matriculaAtiva
        ? "bg-status-success-bg text-status-success"
        : "bg-disabled-bg text-text-secondary"
        }`}
    >
      Matrícula {periodoCurso.matriculaAtiva ? "aberta" : "fechada"}
    </span>

    {onEditar && (
      <button
        type="button"
        onClick={onEditar}
        className="justify-self-end rounded-md border border-border p-1 text-text-secondary transition-colors hover:bg-surface-muted hover:text-primary"
        title={`Editar período ${formatarPeriodo(periodoCurso.periodo)}`}
        aria-label={`Editar período ${formatarPeriodo(periodoCurso.periodo)}`}
      >
        <FiIcons.FiEdit2 size={16} />
      </button>
    )}
  </div>
);

const CursosPage = () => {
  const [busca, setBusca] = React.useState("");
  const [arquivado, setArquivado] = React.useState(false);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const [salvandoAcao, setSalvandoAcao] = React.useState(false);
  const [erroOperacao, setErroOperacao] = React.useState(null);

  const [cursoExpandido, setCursoExpandido] = React.useState(null);
  const [cursoEmEdicao, setCursoEmEdicao] = React.useState(null);
  const [nomeEmEdicao, setNomeEmEdicao] = React.useState("");

  const [cursoParaArquivamento, setCursoParaArquivamento] = React.useState(null);
  const [periodoEmEdicao, setPeriodoEmEdicao] = React.useState(null);
  const [cursoParaAdicionarPeriodo, setCursoParaAdicionarPeriodo] =
    React.useState(null);
  const [cursoComMenuAberto, setCursoComMenuAberto] = React.useState(null);
  const [posicaoMenuAcoes, setPosicaoMenuAcoes] = React.useState(null);
  const menuAcoesRef = React.useRef(null);

  const { cursos, total, carregando, erro, recarregar } = useCursos({
    busca,
    arquivado,
  });

  const fecharMenuAcoes = () => {
    setCursoComMenuAberto(null);
    setPosicaoMenuAcoes(null);
  };

  const alternarMenuAcoes = (evento, cursoId) => {
    if (cursoComMenuAberto === cursoId) {
      fecharMenuAcoes();
      return;
    }

    const botao = evento.currentTarget.getBoundingClientRect();
    const abrirParaCima = window.innerHeight - botao.bottom < 144;

    setPosicaoMenuAcoes({
      top: abrirParaCima ? botao.top - 8 : botao.bottom + 8,
      right: window.innerWidth - botao.right,
      abrirParaCima,
    });
    setCursoComMenuAberto(cursoId);
  };

  React.useEffect(() => {
    const fecharMenuAoClicarFora = (evento) => {
      if (
        menuAcoesRef.current &&
        !menuAcoesRef.current.contains(evento.target)
      ) {
        fecharMenuAcoes();
      }
    };

    document.addEventListener("mousedown", fecharMenuAoClicarFora);
    document.addEventListener("scroll", fecharMenuAcoes, true);

    return () => {
      document.removeEventListener("mousedown", fecharMenuAoClicarFora);
      document.removeEventListener("scroll", fecharMenuAcoes, true);
    };
  }, []);

  const handleSalvarCurso = async (dadosCurso) => {
    setSalvando(true);
    setErroOperacao(null);

    try {
      await cursoService.criarCurso(dadosCurso);

      setModalAberto(false);

      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalCriacaoCurso = () => {
    setErroOperacao(null);
    setModalAberto(true);
  };

  const abrirCriacaoPeriodo = (curso) => {
    setErroOperacao(null);
    fecharMenuAcoes();
    setCursoParaAdicionarPeriodo(curso);
  };

  const alternarPeriodos = (cursoId) => {
    setCursoExpandido((cursoAtual) =>
      cursoAtual === cursoId ? null : cursoId,
    );
  };

  const abrirEdicao = (curso) => {
    setErroOperacao(null);
    fecharMenuAcoes();
    setCursoEmEdicao(curso);
    setNomeEmEdicao(curso.nome);
  };

  const salvarNomeCurso = async (evento) => {
    evento.preventDefault();

    const nome = nomeEmEdicao.trim();

    if (!nome || !cursoEmEdicao) {
      setErroOperacao("Informe o nome do curso.");
      return;
    }

    setSalvandoAcao(true);
    setErroOperacao(null);

    try {
      await cursoService.atualizarNomeCurso(cursoEmEdicao.id, nome);

      setCursoEmEdicao(null);

      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvandoAcao(false);
    }
  };

  const salvarNovoPeriodo = async (dadosPeriodo) => {
    if (!cursoParaAdicionarPeriodo) return;

    setSalvandoAcao(true);
    setErroOperacao(null);

    try {
      await cursoService.criarPeriodoCurso(
        cursoParaAdicionarPeriodo.id,
        dadosPeriodo,
      );

      setCursoParaAdicionarPeriodo(null);

      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvandoAcao(false);
    }
  };

  const confirmarArquivamento = async () => {
    if (!cursoParaArquivamento) {
      return;
    }

    setSalvandoAcao(true);
    setErroOperacao(null);

    try {
      await cursoService.alterarArquivamentoCurso(
        cursoParaArquivamento.id,
        !cursoParaArquivamento.arquivado,
      );

      setCursoParaArquivamento(null);

      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvandoAcao(false);
    }
  };

  const abrirEdicaoPeriodo = (curso, periodo) => {
    setErroOperacao(null);

    setPeriodoEmEdicao({
      cursoId: curso.id,
      periodo,
    });
  };

  const salvarPeriodo = async (dadosPeriodo) => {
    if (!periodoEmEdicao) {
      return;
    }

    setSalvandoAcao(true);
    setErroOperacao(null);

    try {
      await cursoService.atualizarPeriodoCurso(
        periodoEmEdicao.cursoId,
        periodoEmEdicao.periodo.id,
        dadosPeriodo,
      );

      setPeriodoEmEdicao(null);

      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvandoAcao(false);
    }
  };

  const cursoDoMenu = cursos.find(
    (curso) => curso.id === cursoComMenuAberto,
  );

  const columns = [
    {
      key: "nome",
      label: "Curso",
      render: (curso) => (
        <div>
          <p className="font-semibold text-text-primary">{curso.nome}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {curso.periodos.length} período
            {curso.periodos.length === 1 ? "" : "s"}
          </p>
        </div>
      ),
    },

    {
      key: "periodos",
      label: "Períodos",
      render: (curso) => {
        const primeiroPeriodo = curso.periodos[0];
        const periodosRestantes = curso.periodos.slice(1);
        const expandido = cursoExpandido === curso.id;
        return primeiroPeriodo ? (
          <div className="space-y-1.5">
            <PeriodoResumo
              periodoCurso={primeiroPeriodo}
              onEditar={
                curso.arquivado
                  ? null
                  : () => abrirEdicaoPeriodo(curso, primeiroPeriodo)
              }
            />

            {expandido &&
              periodosRestantes.map((periodoCurso) => (
                <div
                  key={periodoCurso.id}
                  className="animate-offer-expand"
                >
                  <PeriodoResumo
                    periodoCurso={periodoCurso}
                    onEditar={
                      curso.arquivado
                        ? null
                        : () => abrirEdicaoPeriodo(curso, periodoCurso)
                    }
                  />
                </div>
              ))}

            {periodosRestantes.length > 0 && (
              <button
                type="button"
                onClick={() => alternarPeriodos(curso.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                {expandido
                  ? "Ver menos"
                  : `Ver mais ${periodosRestantes.length} período${periodosRestantes.length === 1 ? "" : "s"
                  }`}

                <FiIcons.FiChevronDown
                  size={16}
                  className={`transition-transform duration-200 ease-out ${expandido ? "rotate-180" : ""
                    }`}
                />
              </button>
            )}
          </div>
        ) : (
          "—"
        );
      },
    },

    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",

      render: (curso) => {
        const menuAberto = cursoComMenuAberto === curso.id;

        return (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={(evento) => alternarMenuAcoes(evento, curso.id)}
              className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              aria-label={`Abrir ações do curso ${curso.nome}`}
              aria-expanded={menuAberto}
              title="Ações"
            >
              <FiIcons.FiMoreVertical size={18} />
            </button>

          </div>
        );
      },
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-text-secondary">
            {total} curso{total === 1 ? "" : "s"}{" "}
            {arquivado ? "arquivado" : "ativo"}
            {total === 1 ? "" : "s"} encontrado
            {total === 1 ? "" : "s"}.
          </p>
        </div>

        <Button
          leftIcon={<FiIcons.FiPlus />}
          className="w-full sm:w-auto"
          onClick={abrirModalCriacaoCurso}
        >
          Adicionar curso
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Pesquisar por nome do curso..."
          icon={<FiIcons.FiSearch />}
          size="md"
          className="max-w-xl"
        />

        <div className="flex rounded-btn border border-border p-1">
          <button
            type="button"
            onClick={() => setArquivado(false)}
            className={`rounded-btn px-3 py-2 text-sm font-medium transition-colors ${!arquivado
              ? "bg-primary text-text-inverse"
              : "text-text-secondary hover:bg-surface-muted"
              }`}
          >

            Ativos
          </button>

          <button
            type="button"
            onClick={() => setArquivado(true)}
            className={`rounded-btn px-3 py-2 text-sm font-medium transition-colors ${arquivado
              ? "bg-primary text-text-inverse"
              : "text-text-secondary hover:bg-surface-muted"
              }`}
          >
            Arquivados
          </button>
        </div>
      </div>

      {erro && <Alert type="error" message={erro} />}

      {carregando ? (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-text-secondary">
          Carregando cursos...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={cursos}
          getRowKey={(curso) => curso.id}
          emptyMessage={
            arquivado
              ? "Nenhum curso arquivado encontrado."
              : "Nenhum curso ativo encontrado."
          }
        />
      )}

      {cursoDoMenu &&
        posicaoMenuAcoes &&
        createPortal(
          <div
            ref={menuAcoesRef}
            className="fixed z-[60] w-52 rounded-lg border border-border bg-surface py-1 text-left shadow-lg"
            style={{
              top: posicaoMenuAcoes.top,
              right: posicaoMenuAcoes.right,
              transform: posicaoMenuAcoes.abrirParaCima
                ? "translateY(-100%)"
                : undefined,
            }}
          >
            {!cursoDoMenu.arquivado && (
              <button
                type="button"
                onClick={() => abrirCriacaoPeriodo(cursoDoMenu)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
              >
                <FiIcons.FiPlus size={16} />
                Adicionar período
              </button>
            )}

            <button
              type="button"
              onClick={() => abrirEdicao(cursoDoMenu)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
            >
              <FiIcons.FiEdit2 size={16} />
              Editar nome
            </button>

            <button
              type="button"
              onClick={() => {
                setErroOperacao(null);
                fecharMenuAcoes();
                setCursoParaArquivamento(cursoDoMenu);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-surface-muted ${cursoDoMenu.arquivado
                ? "text-status-success"
                : "text-status-danger"
                }`}
            >
              {cursoDoMenu.arquivado ? (
                <FiIcons.FiRotateCcw size={16} />
              ) : (
                <FiIcons.FiArchive size={16} />
              )}
              {cursoDoMenu.arquivado ? "Desarquivar" : "Arquivar"}
            </button>
          </div>,
          document.body,
        )}

      <AdicionarCursoModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSalvar={handleSalvarCurso}
        salvando={salvando}
        erro={erroOperacao}
      />

      <AdicionarPeriodoModal
        aberto={Boolean(cursoParaAdicionarPeriodo)}
        onFechar={() => setCursoParaAdicionarPeriodo(null)}
        onSalvar={salvarNovoPeriodo}
        salvando={salvandoAcao}
        erro={erroOperacao}
      />

      <Modal
        aberto={Boolean(cursoEmEdicao)}
        onFechar={() => !salvandoAcao && setCursoEmEdicao(null)}
        titulo="Editar curso"
        largura="max-w-lg"
      >
        <form onSubmit={salvarNomeCurso} className="space-y-5">
          {erroOperacao && (
            <Alert type="error" message={erroOperacao} />
          )}

          <Input
            label="Nome do curso"
            value={nomeEmEdicao}
            onChange={(evento) => setNomeEmEdicao(evento.target.value)}
            required
            autoFocus
          />

          <footer className="flex justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCursoEmEdicao(null)}
              disabled={salvandoAcao}
            >
              Cancelar
            </Button>

            <Button type="submit" loading={salvandoAcao}>
              Salvar alterações
            </Button>
          </footer>
        </form>
      </Modal>

      <Modal
        aberto={Boolean(cursoParaArquivamento)}
        onFechar={() =>
          !salvandoAcao && setCursoParaArquivamento(null)
        }
        titulo={
          cursoParaArquivamento?.arquivado
            ? "Desarquivar curso"
            : "Arquivar curso"
        }
        largura="max-w-lg"
      >
        <div className="space-y-5">
          {erroOperacao && (
            <Alert type="error" message={erroOperacao} />
          )}

          <p className="text-text-secondary">
            {cursoParaArquivamento?.arquivado
              ? `Deseja desarquivar o curso ${cursoParaArquivamento.nome}?`
              : `Deseja arquivar o curso ${cursoParaArquivamento?.nome}? As matrículas dos períodos serão fechadas.`}
          </p>

          <footer className="flex justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCursoParaArquivamento(null)}
              disabled={salvandoAcao}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant={
                cursoParaArquivamento?.arquivado
                  ? "success"
                  : "danger"
              }
              onClick={confirmarArquivamento}
              loading={salvandoAcao}
            >
              {cursoParaArquivamento?.arquivado
                ? "Desarquivar"
                : "Arquivar"}
            </Button>
          </footer>
        </div>
      </Modal>

      <EditarPeriodoModal
        aberto={Boolean(periodoEmEdicao)}
        periodo={periodoEmEdicao?.periodo ?? null}
        onFechar={() => setPeriodoEmEdicao(null)}
        onSalvar={salvarPeriodo}
        salvando={salvandoAcao}
        erro={erroOperacao}
      />
    </section>
  );
};

export default CursosPage;
