import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";

import AdicionarCursoModal from "../components/cursos/AdicionarCursoModal";
import AdicionarPeriodoModal from "../components/cursos/AdicionarPeriodoModal";
import ConfirmarArquivamentoCursoModal from "../components/cursos/ConfirmarArquivamentoCursoModal";
import EditarCursoModal from "../components/cursos/EditarCursoModal";
import EditarPeriodoModal from "../components/cursos/EditarPeriodoModal";
import MenuAcoesCurso from "../components/cursos/MenuAcoesCurso";
import PeriodoResumo from "../components/cursos/PeriodoResumo";

import { useCursos } from "../hooks/useCursos";
import * as cursoService from "../services/CursosService";

const CursosPage = () => {
  const [busca, setBusca] = React.useState("");
  const [arquivado, setArquivado] = React.useState(false);

  const [modalAberto, setModalAberto] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const [salvandoAcao, setSalvandoAcao] = React.useState(false);
  const [erroOperacao, setErroOperacao] = React.useState(null);

  const [cursoExpandido, setCursoExpandido] = React.useState(null);
  const [cursoEmEdicao, setCursoEmEdicao] = React.useState(null);

  const [cursoParaArquivamento, setCursoParaArquivamento] = React.useState(null);
  const [periodoEmEdicao, setPeriodoEmEdicao] = React.useState(null);
  const [cursoParaAdicionarPeriodo, setCursoParaAdicionarPeriodo] = React.useState(null);
  const [cursoComMenuAberto, setCursoComMenuAberto] = React.useState(null);

  const { cursos, total, carregando, erro, recarregar } = useCursos({
    busca,
    arquivado,
  });

  const fecharMenuAcoes = () => {
    setCursoComMenuAberto(null);
  };

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
  };

  const salvarNomeCurso = async (nome) => {
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

  const columnsCurso = [
  //*nome
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

    //*periodo
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

    //*ações
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",

      render: (curso) => {
        return (
          <MenuAcoesCurso
            curso={curso}
            aberto={cursoComMenuAberto === curso.id}
            onAbrir={() => setCursoComMenuAberto(curso.id)}
            onFechar={fecharMenuAcoes}
            onAdicionarPeriodo={abrirCriacaoPeriodo}
            onEditarNome={abrirEdicao}
            onAlterarArquivamento={(cursoSelecionado) => {
              setErroOperacao(null);
              setCursoParaArquivamento(cursoSelecionado);
            }}
          />
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
          columns={columnsCurso}
          data={cursos}
          getRowKey={(curso) => curso.id}
          emptyMessage={
            arquivado
              ? "Nenhum curso arquivado encontrado."
              : "Nenhum curso ativo encontrado."
          }
        />
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

      <EditarCursoModal
        key={cursoEmEdicao?.id ?? "sem-curso"}
        curso={cursoEmEdicao}
        onFechar={() => setCursoEmEdicao(null)}
        onSalvar={salvarNomeCurso}
        salvando={salvandoAcao}
        erro={erroOperacao}
      />

      <ConfirmarArquivamentoCursoModal
        curso={cursoParaArquivamento}
        onFechar={() => setCursoParaArquivamento(null)}
        onConfirmar={confirmarArquivamento}
        salvando={salvandoAcao}
        erro={erroOperacao}
      />

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
