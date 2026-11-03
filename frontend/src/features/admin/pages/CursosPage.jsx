import * as React from "react";
import {
  FiChevronDown,
  FiPlus,
  FiEdit2,
  FiRotateCcw,
  FiArchive,
  FiSearch,
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

import { useCursos } from "../hooks/useCursos";
import * as cursoService from "../services/cursoService";
import { useAuth } from "../../../context/authContext";
import { useToast } from "../../../context/toastContext";

const OPCOES_STATUS_CURSO = [
  { valor: false, label: "Ativos" },
  { valor: true, label: "Arquivados" },
];

const CursosPage = () => {
  const toast = useToast();
  const { usuario: usuarioLogado } = useAuth();
  const ehAdmin = usuarioLogado?.tipo === "admin";

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
      if (modalAtivo?.curso) {
        await cursoService.atualizarCurso(modalAtivo.curso.id, {
          nome: dados.nome,
        });
      } else {
        await cursoService.criarCurso(dados);
      }

      setModalAtivo(null);
      await recarregar();
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

      setModalAtivo(null);
      await recarregar();
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const confirmarArquivamento = async () => {
    if (!modalAtivo?.curso) return;

    setSalvando(true);

    try {
      await cursoService.atualizarCurso(modalAtivo.curso.id, {
        arquivado: !modalAtivo.curso.arquivado,
      });

      setModalAtivo(null);
      await recarregar();
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
      key: "vagasTotais",
      label: "Total de Vagas",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (curso) => {
        const totalVagas = (curso.periodos ?? []).reduce(
          (acc, p) => acc + (p.vagasTotais ?? 0),
          0,
        );
        return (
          <span className="font-semibold text-text-primary">
            {totalVagas} {totalVagas === 1 ? "vaga" : "vagas"}
          </span>
        );
      },
    },
    {
      key: "periodos",
      label: "Períodos",
      render: (curso) => {
        const periodos = curso.periodos || [];
        const primeiroPeriodo = periodos[0];
        const periodosRestantes = periodos.slice(1);
        const expandido = cursoExpandido === curso.id;

        return primeiroPeriodo ? (
          <div className="space-y-1.5">
            <PeriodoResumo
              periodoCurso={primeiroPeriodo}
              onEditar={
                curso.arquivado || !ehAdmin
                  ? null
                  : () =>
                      setModalAtivo({
                        tipo: "periodo",
                        curso,
                        periodo: primeiroPeriodo,
                      })
              }
            />

            {expandido &&
              periodosRestantes.map((periodoCurso) => (
                <div key={periodoCurso.id} className="pt-1">
                  <PeriodoResumo
                    periodoCurso={periodoCurso}
                    onEditar={
                      curso.arquivado || !ehAdmin
                        ? null
                        : () =>
                            setModalAtivo({
                              tipo: "periodo",
                              curso,
                              periodo: periodoCurso,
                            })
                    }
                  />
                </div>
              ))}

            {periodosRestantes.length > 0 && (
              <button
                type="button"
                onClick={() => alternarPeriodos(curso.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover cursor-pointer"
                aria-expanded={expandido}
              >
                {expandido
                  ? "Ver menos"
                  : `Ver mais ${periodosRestantes.length} período${
                      periodosRestantes.length === 1 ? "" : "s"
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
        ) : (
          <p className="text-xs text-text-secondary">
            Nenhum período cadastrado
          </p>
        );
      },
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (curso) => {
        if (!ehAdmin) return null;

        return (
          <TableMenuActions
            label={`Ações do curso ${curso.nome}`}
            itens={[
              !curso.arquivado && {
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
        onFechar={() => setModalAtivo(null)}
        onSalvar={handleSalvarPeriodo}
        salvando={salvando}
      />

      <ConfirmarModal
        aberto={modalAtivo?.tipo === "arquivar"}
        onFechar={() => setModalAtivo(null)}
        onConfirmar={confirmarArquivamento}
        titulo={
          modalAtivo?.curso?.arquivado ? "Desarquivar curso" : "Arquivar curso"
        }
        mensagem={
          modalAtivo?.curso?.arquivado
            ? `Deseja desarquivar o curso ${modalAtivo?.curso?.nome}?`
            : `Deseja arquivar o curso ${modalAtivo?.curso?.nome}? As matrículas dos períodos serão fechadas.`
        }
        textoConfirmar={
          modalAtivo?.curso?.arquivado ? "Desarquivar" : "Arquivar"
        }
        variante={modalAtivo?.curso?.arquivado ? "success" : "danger"}
        salvando={salvando}
      />
    </section>
  );
};

export default CursosPage;
