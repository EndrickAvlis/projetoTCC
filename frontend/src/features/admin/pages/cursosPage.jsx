import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";

import CursoModal from "../components/cursos/CursoModal";
import PeriodoModal from "../components/cursos/PeriodoModal";
import ConfirmarArquivamentoCursoModal from "../components/cursos/ConfirmarArquivamentoCursoModal";
import MenuAcoesCurso from "../components/cursos/MenuAcoesCurso";
import PeriodoResumo from "../components/cursos/PeriodoResumo";

import { useCursos } from "../hooks/useCursos";
import * as cursoService from "../services/cursosService";

const CursosPage = () => {
  const [busca, setBusca] = React.useState("");
  const [arquivado, setArquivado] = React.useState(false);

  const [salvando, setSalvando] = React.useState(false);
  const [erroOperacao, setErroOperacao] = React.useState(null);

  // Modal de Curso
  const [modalCursoAberto, setModalCursoAberto] = React.useState(false);
  const [cursoEmEdicao, setCursoEmEdicao] = React.useState(null);

  // Modal de Período
  const [modalPeriodo, setModalPeriodo] = React.useState(null);

  // Modal de Arquivamento
  const [cursoParaArquivamento, setCursoParaArquivamento] =
    React.useState(null);

  // UI da Tabela
  const [cursoExpandido, setCursoExpandido] = React.useState(null);
  const [cursoComMenuAberto, setCursoComMenuAberto] = React.useState(null);

  const { cursos, total, carregando, erro, recarregar } = useCursos({
    busca,
    arquivado,
  });

  //Adição e edição de cursos
  const fecharModalCurso = () => {
    setModalCursoAberto(false);
    setCursoEmEdicao(null);
    setErroOperacao(null);
  };
  const abrirModalCurso = (curso = null) => {
    setErroOperacao(null);
    fecharMenuAcoes();
    setCursoEmEdicao(curso);
    setModalCursoAberto(true);
  };
  const handleSalvarCurso = async (dados) => {
    setSalvando(true);
    setErroOperacao(null);

    try {
      if (cursoEmEdicao) {
        await cursoService.atualizarNomeCurso(cursoEmEdicao.id, dados.nome);
      } else {
        await cursoService.criarCurso(dados);
      }

      fecharModalCurso();
      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvando(false);
    }
  };

  //Adição e edição de periodos
  const fecharModalPeriodo = () => {
    setModalPeriodo(null);
    setErroOperacao(null);
  };
  const abrirModalPeriodo = (curso, periodo = null) => {
    setErroOperacao(null);
    fecharMenuAcoes();
    setModalPeriodo({ curso, periodo });
  };
  const handleSalvarPeriodo = async (dados) => {
    if (!modalPeriodo) return;

    const { curso, periodo } = modalPeriodo;

    setSalvando(true);
    setErroOperacao(null);

    try {
      if (periodo) {
        await cursoService.atualizarPeriodoCurso(curso.id, periodo.id, dados);
      } else {
        await cursoService.criarPeriodoCurso(curso.id, dados);
      }

      fecharModalPeriodo();
      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const confirmarArquivamento = async () => {
    if (!cursoParaArquivamento) {
      return;
    }

    setSalvando(true);
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
      setSalvando(false);
    }
  };
  const alternarPeriodos = (cursoId) => {
    setCursoExpandido((cursoAtual) =>
      cursoAtual === cursoId ? null : cursoId,
    );
  };
  const fecharMenuAcoes = () => {
    setCursoComMenuAberto(null);
  };

  const columnsCurso = [
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
                  : () => abrirModalPeriodo(curso, primeiroPeriodo)
              }
            />

            {expandido &&
              periodosRestantes.map((periodoCurso) => (
                <div key={periodoCurso.id} className="animate-offer-expand">
                  <PeriodoResumo
                    periodoCurso={periodoCurso}
                    onEditar={
                      curso.arquivado
                        ? null
                        : () => abrirModalPeriodo(curso, periodoCurso)
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
                  : `Ver mais ${periodosRestantes.length} período${
                      periodosRestantes.length === 1 ? "" : "s"
                    }`}

                <FiIcons.FiChevronDown
                  size={16}
                  className={`transition-transform duration-200 ease-out ${
                    expandido ? "rotate-180" : ""
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
            onAdicionarPeriodo={abrirModalPeriodo}
            onEditarNome={abrirModalCurso}
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
          onClick={() => abrirModalCurso()}
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
            className={`rounded-btn px-3 py-2 text-sm font-medium transition-colors ${
              !arquivado
                ? "bg-primary text-text-inverse"
                : "text-text-secondary hover:bg-surface-muted"
            }`}
          >
            Ativos
          </button>

          <button
            type="button"
            onClick={() => setArquivado(true)}
            className={`rounded-btn px-3 py-2 text-sm font-medium transition-colors ${
              arquivado
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

      <CursoModal
        aberto={modalCursoAberto}
        curso={cursoEmEdicao}
        onFechar={fecharModalCurso}
        onSalvar={handleSalvarCurso}
        salvando={salvando}
        erro={erroOperacao}
      />
      <PeriodoModal
        aberto={Boolean(modalPeriodo)}
        periodo={modalPeriodo?.periodo}
        onFechar={fecharModalPeriodo}
        onSalvar={handleSalvarPeriodo}
        salvando={salvando}
        erro={erroOperacao}
      />
      <ConfirmarArquivamentoCursoModal
        curso={cursoParaArquivamento}
        onFechar={() => setCursoParaArquivamento(null)}
        onConfirmar={confirmarArquivamento}
        salvando={salvando}
        erro={erroOperacao}
      />
    </section>
  );
};

export default CursosPage;
