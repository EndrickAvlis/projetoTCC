import * as React from "react";
import {
  FiChevronDown,
  FiPlus,
  FiEdit2,
  FiRotateCcw,
  FiArchive,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import TableFiltro from "../../../components/ui/TableFiltro";
import TableMenuActions from "../../../components/ui/TableMenuActions";
import ConfirmarModal from "../../../components/ui/ConfirmarModal";

import CursoModal from "../components/cursos/CursoModal";
import PeriodoModal from "../components/cursos/PeriodoModal";
import PeriodoResumo from "../components/cursos/PeriodoResumo";

import { PERIODOS_CURSO } from "../../../constants/cursoOptions";
import { useCursos } from "../hooks/useCursos";
import * as cursoService from "../services/cursoService";
import { useToast } from "../../../context/toastContext";
import { formatarPeriodo } from "../../../utils/formatters";

const OPCOES_STATUS_CURSO = [
  { valor: false, label: "Ativos" },
  { valor: true, label: "Arquivados" },
];

const CursosPage = () => {
  const toast = useToast();

  const [busca, setBusca] = React.useState("");
  const [arquivado, setArquivado] = React.useState(false);

  const [salvando, setSalvando] = React.useState(false);
  const [modalAtivo, setModalAtivo] = React.useState(null);
  const [cursoExpandido, setCursoExpandido] = React.useState(null);

  const { cursos, total, carregando, erro, recarregar } = useCursos({
    busca,
    arquivado,
  });

  const handleSalvarCurso = async (dados) => {
    setSalvando(true);

    try {
      const emEdicao = Boolean(modalAtivo?.curso);

      if (emEdicao) {
        await cursoService.atualizarCurso(modalAtivo.curso.id, {
          nome: dados.nome,
        });
      } else {
        await cursoService.criarCurso(dados);
      }

      toast.sucesso(
        emEdicao
          ? "Curso atualizado com sucesso!"
          : "Curso cadastrado com sucesso!",
      );
      setModalAtivo(null);
      await recarregar({ silencioso: true });
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarPeriodo = async (dados) => {
    if (!modalAtivo?.curso) return;

    const { curso, periodo } = modalAtivo;
    setSalvando(true);

    try {
      if (periodo) {
        await cursoService.atualizarPeriodo(curso.id, periodo.id, dados);
      } else {
        await cursoService.criarPeriodo(curso.id, dados);
      }

      toast.sucesso(
        periodo
          ? "Período atualizado com sucesso!"
          : "Período adicionado com sucesso!",
      );
      setModalAtivo(null);
      await recarregar({ silencioso: true });
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const obterConfirmacao = () => {
    const curso = modalAtivo?.curso;
    const periodo = modalAtivo?.periodo;

    if (modalAtivo?.tipo === "arquivar" && curso) {
      return curso.arquivado
        ? {
            titulo: "Desarquivar curso",
            mensagem: `Deseja desarquivar o curso ${curso.nome}? Os períodos permanecerão fechados até que sejam reabertos.`,
            textoConfirmar: "Desarquivar",
            variante: "success",
            sucesso: "Curso desarquivado com sucesso!",
            acao: () =>
              cursoService.atualizarCurso(curso.id, { arquivado: false }),
          }
        : {
            titulo: "Arquivar curso",
            mensagem: `Deseja arquivar o curso ${curso.nome}? As matrículas dos períodos serão fechadas.`,
            textoConfirmar: "Arquivar",
            variante: "danger",
            sucesso: "Curso arquivado com sucesso!",
            acao: () =>
              cursoService.atualizarCurso(curso.id, { arquivado: true }),
          };
    }

    if (modalAtivo?.tipo === "excluirCurso" && curso) {
      return {
        titulo: "Excluir curso",
        mensagem: `Deseja excluir permanentemente o curso ${curso.nome}? Essa ação não pode ser desfeita.`,
        textoConfirmar: "Excluir",
        variante: "danger",
        sucesso: "Curso excluído com sucesso!",
        acao: () => cursoService.excluirCurso(curso.id),
      };
    }

    if (modalAtivo?.tipo === "excluirPeriodo" && curso && periodo) {
      return {
        titulo: "Excluir período",
        mensagem: `Deseja excluir o período ${formatarPeriodo(periodo.periodo)} do curso ${curso.nome}?`,
        textoConfirmar: "Excluir",
        variante: "danger",
        sucesso: "Período excluído com sucesso!",
        acao: () => cursoService.excluirPeriodo(curso.id, periodo.id),
      };
    }

    return null;
  };

  const confirmacaoAtiva = obterConfirmacao();

  const handleConfirmarAcao = async () => {
    if (!confirmacaoAtiva) return;

    setSalvando(true);

    try {
      await confirmacaoAtiva.acao();
      toast.sucesso(confirmacaoAtiva.sucesso);
      setModalAtivo(null);
      await recarregar({ silencioso: true });
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const alternarPeriodos = (cursoId) => {
    setCursoExpandido((cursoAtual) =>
      cursoAtual === cursoId ? null : cursoId,
    );
  };

  const columnsCurso = [
    {
      key: "nome",
      label: "Curso",
      render: (curso) => (
        <div>
          <p className="font-semibold text-text-primary">{curso.nome}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {curso.periodos?.length ?? 0}{" "}
            {curso.periodos?.length === 1 ? "período" : "períodos"}
          </p>
        </div>
      ),
    },
    {
      key: "periodos",
      label: "Períodos",
      render: (curso) => {
        const periodos = curso.periodos || [];

        if (periodos.length === 0) {
          return (
            <p className="text-xs text-text-secondary">
              Nenhum período cadastrado
            </p>
          );
        }

        const expandido = cursoExpandido === curso.id;
        const periodosRestantes = periodos.length - 1;
        const periodosVisiveis = expandido ? periodos : periodos.slice(0, 1);

        return (
          <div className="space-y-1.5">
            {periodosVisiveis.map((periodoCurso) => (
              <PeriodoResumo
                key={periodoCurso.id}
                periodoCurso={periodoCurso}
                onEditar={
                  curso.arquivado
                    ? null
                    : () =>
                        setModalAtivo({
                          tipo: "periodo",
                          curso,
                          periodo: periodoCurso,
                        })
                }
                onExcluir={
                  curso.arquivado ||
                  periodoCurso.possuiVinculos ||
                  periodos.length <= 1
                    ? null
                    : () =>
                        setModalAtivo({
                          tipo: "excluirPeriodo",
                          curso,
                          periodo: periodoCurso,
                        })
                }
              />
            ))}

            {periodosRestantes > 0 && (
              <button
                type="button"
                onClick={() => alternarPeriodos(curso.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover cursor-pointer"
                aria-expanded={expandido}
              >
                {expandido
                  ? "Ver menos"
                  : `Ver mais ${periodosRestantes} período${
                      periodosRestantes === 1 ? "" : "s"
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
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (curso) => {
        const periodos = curso.periodos || [];
        const podeAdicionarPeriodo =
          !curso.arquivado && periodos.length < PERIODOS_CURSO.length;

        return (
          <TableMenuActions
            label={`Ações do curso ${curso.nome}`}
            itens={[
              podeAdicionarPeriodo && {
                label: "Adicionar período",
                icone: FiPlus,
                onClick: () => setModalAtivo({ tipo: "periodo", curso }),
              },
              {
                label: "Editar nome",
                icone: FiEdit2,
                onClick: () => setModalAtivo({ tipo: "curso", curso }),
              },
              {
                label: curso.arquivado ? "Desarquivar" : "Arquivar",
                icone: curso.arquivado ? FiRotateCcw : FiArchive,
                onClick: () => setModalAtivo({ tipo: "arquivar", curso }),
                variante: curso.arquivado ? "success" : "danger",
              },
              curso.arquivado &&
                !curso.possuiVinculos && {
                  label: "Excluir curso",
                  icone: FiTrash2,
                  onClick: () =>
                    setModalAtivo({ tipo: "excluirCurso", curso }),
                  variante: "danger",
                },
            ]}
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
            {total} {total === 1 ? "curso" : "cursos"}{" "}
            {arquivado ? "arquivado" : "ativo"}
            {total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}.
          </p>
        </div>

        <Button
          leftIcon={<FiPlus />}
          className="w-full sm:w-auto"
          onClick={() => setModalAtivo({ tipo: "curso" })}
        >
          Adicionar curso
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Pesquisar por nome do curso..."
          maxLength={100}
          icon={<FiSearch />}
          size="md"
          className="max-w-xl"
        />

        <TableFiltro
          options={OPCOES_STATUS_CURSO}
          value={arquivado}
          onChange={setArquivado}
          ariaLabel="Situação dos cursos"
        />
      </div>

      {erro && <Alert type="error" message={erro} />}

      <DataTable
        columns={columnsCurso}
        data={cursos}
        carregando={carregando}
        getRowKey={(curso) => curso.id}
        emptyMessage={
          arquivado
            ? "Nenhum curso arquivado encontrado."
            : "Nenhum curso ativo encontrado."
        }
      />

      <CursoModal
        aberto={modalAtivo?.tipo === "curso"}
        curso={modalAtivo?.curso}
        onFechar={() => setModalAtivo(null)}
        onSalvar={handleSalvarCurso}
        salvando={salvando}
      />

      <PeriodoModal
        aberto={modalAtivo?.tipo === "periodo"}
        periodo={modalAtivo?.periodo}
        periodosExistentes={(modalAtivo?.curso?.periodos ?? []).map(
          (p) => p.periodo,
        )}
        onFechar={() => setModalAtivo(null)}
        onSalvar={handleSalvarPeriodo}
        salvando={salvando}
      />

      <ConfirmarModal
        aberto={Boolean(confirmacaoAtiva)}
        onFechar={() => setModalAtivo(null)}
        onConfirmar={handleConfirmarAcao}
        titulo={confirmacaoAtiva?.titulo ?? ""}
        mensagem={confirmacaoAtiva?.mensagem ?? ""}
        textoConfirmar={confirmacaoAtiva?.textoConfirmar}
        variante={confirmacaoAtiva?.variante}
        salvando={salvando}
      />
    </section>
  );
};

export default CursosPage;
