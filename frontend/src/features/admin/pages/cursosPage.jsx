import { useState } from "react";
import { FiChevronDown, FiPlus, FiSearch } from "react-icons/fi";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import CursoFormModal from "../components/cursos/CursoFormModal";
import { useCursos } from "../hooks/useCursos";
import { criarCurso } from "../services/cursosService";

const nomesPeriodos = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
};

const formatarPeriodo = (periodo) => nomesPeriodos[periodo] ?? periodo;

const PeriodoResumo = ({ periodoCurso }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
    <span className="font-medium text-text-primary">
      {formatarPeriodo(periodoCurso.periodo)}
    </span>
    <span className="text-text-secondary">{periodoCurso.vagasTotais} vagas</span>
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${periodoCurso.matriculaAtiva
          ? "bg-status-success-bg text-status-success"
          : "bg-disabled-bg text-text-secondary"
        }`}
    >
      Matrícula {periodoCurso.matriculaAtiva ? "aberta" : "fechada"}
    </span>
  </div>
);

const CursosPage = () => {
  const [busca, setBusca] = useState("");
  const [arquivado, setArquivado] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroOperacao, setErroOperacao] = useState(null);
  const [cursoExpandido, setCursoExpandido] = useState(null);

  const { cursos, total, carregando, erro, recarregar } = useCursos({
    busca,
    arquivado,
  });

  const handleSalvarCurso = async (dadosCurso) => {
    setSalvando(true);
    setErroOperacao(null);

    try {
      await criarCurso(dadosCurso);
      setModalAberto(false);
      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalCriacao = () => {
    setErroOperacao(null);
    setModalAberto(true);
  };

  const alternarPeriodos = (cursoId) => {
    setCursoExpandido((cursoAtual) =>
      cursoAtual === cursoId ? null : cursoId,
    );
  };

  const columns = [
    {
      key: "nome",
      label: "Curso",
      render: (curso) => (
        <div>
          <p className="font-semibold text-text-primary">{curso.nome}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {curso.periodos.length} período{curso.periodos.length === 1 ? "" : "s"}
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
          <div className="space-y-2">
            <PeriodoResumo periodoCurso={primeiroPeriodo} />

            {expandido &&
              periodosRestantes.map((periodoCurso) => (
                <div key={periodoCurso.id} className="animate-offer-expand">
                  <PeriodoResumo periodoCurso={periodoCurso} />
                </div>
              ))}

            {periodosRestantes.length > 0 && (
              <button
                type="button"
                onClick={() => alternarPeriodos(curso.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary shadow-sm transition-[background-color,border-color,color,transform] duration-200 ease-out hover:border-primary hover:bg-primary hover:text-text-inverse active:scale-[0.97]"
              >
                {expandido
                  ? "Ocultar períodos"
                  : `Ver mais ${periodosRestantes.length} período${periodosRestantes.length === 1 ? "" : "s"
                  }`}
                <FiChevronDown
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
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-text-secondary">
            {total} curso{total === 1 ? "" : "s"} {arquivado ? "arquivado" : "ativo"}
            {total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}.
          </p>
        </div>

        <Button
          leftIcon={<FiPlus />}
          className="w-full sm:w-auto"
          onClick={abrirModalCriacao}
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

      <CursoFormModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSalvar={handleSalvarCurso}
        salvando={salvando}
        erro={erroOperacao}
      />
    </section>
  );
};

export default CursosPage;
