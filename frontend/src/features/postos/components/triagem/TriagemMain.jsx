import * as React from "react";
import { FiClock, FiAlertCircle } from "react-icons/fi";
import { useTriagem } from "../../hooks/useTriagem";
import { usePendencias } from "../../hooks/usePendencias";
import { listarCursos } from "../../services/TriagemService";
import AtendimentoActions from "../../layout/AtendimentoActions";
import BuscarAlunos from "./BuscarAlunos";
import DadosAlunoForm from "./DadosAlunoForm";
import DocumentosPendentes from "./DocumentosPendentes";
import PendenciasGrid from "./PendenciasGrid";
import DetalhePendencia from "./DetalhePendencia";

export const TriagemMain = () => {
  const {
    fase,
    senhaAtual,
    iniciar,
    finalizar,
    salvarPendencia,
    rechamar,
    carregando: carregandoTriagem,
    erro: erroTriagem,
  } = useTriagem();

  const {
    pendencias,
    total: totalPendencias,
    pendenciaSelecionada,
    selecionarPendencia,
    retomar,
    carregando: carregandoPendencias,
    erro: erroPendencias,
  } = usePendencias();

  const [abaAtiva, setAbaAtiva] = React.useState("atendimento");
  const [cursos, setCursos] = React.useState([]);
  const [dadosAluno, setDadosAluno] = React.useState({
    nome: "",
    classificacao: "",
    curso: "",
    periodo: "",
    ano: "1",
    cidade: "",
    sexo: "",
    escolaridadePublica: "null",
  });
  const [documentosSelecionados, setDocumentosSelecionados] = React.useState([]);
  const [erros] = React.useState({});
  const [salvandoPendencia, setSalvandoPendencia] = React.useState(false);

  React.useEffect(() => {
    const carregarListaCursos = async () => {
      try {
        const res = await listarCursos();
        setCursos(res);
      } catch {
        setCursos([]);
      }
    };
    carregarListaCursos();
  }, []);

  const handleSelecionarAluno = (aluno) => {
    const matricula = aluno.matriculas[0];
    setDadosAluno({
      nome: aluno.nome,
      classificacao: matricula?.classificacao ? String(matricula.classificacao) : "",
      curso: matricula?.cursoId ? String(matricula.cursoId) : "",
      periodo: matricula?.periodo ? matricula.periodo : "",
      ano: matricula?.anoEscolar ? String(matricula.anoEscolar) : "1",
      cidade: aluno.cidade ? aluno.cidade : "",
      sexo: aluno.sexo ? aluno.sexo : "",
      escolaridadePublica: aluno.escolaridadePublica !== null ? String(aluno.escolaridadePublica) : "null",
    });
  };

  const handleNovoAluno = () => {
    setDadosAluno({
      nome: "",
      classificacao: "",
      curso: "",
      periodo: "",
      ano: "1",
      cidade: "",
      sexo: "",
      escolaridadePublica: "null",
    });
  };

  const handleChangeCampo = (campo, valor) => {
    setDadosAluno((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSalvarPendencia = async () => {
    if (documentosSelecionados.length === 0) return;
    try {
      setSalvandoPendencia(true);
      await salvarPendencia(documentosSelecionados);
      setDocumentosSelecionados([]);
      handleNovoAluno();
    } finally {
      setSalvandoPendencia(false);
    }
  };

  const handleFinalizar = async () => {
    await finalizar();
    handleNovoAluno();
    setDocumentosSelecionados([]);
  };

  const handleRetomar = async (senhaId) => {
    const res = await retomar(senhaId);
    if (res?.documentos) {
      setDocumentosSelecionados(res.documentos);
    }
    setAbaAtiva("atendimento");
  };

  const podeFinalizar =
    fase === "iniciada" &&
    Boolean(dadosAluno.nome.trim()) &&
    documentosSelecionados.length === 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex border-b border-border gap-1">
        <button
          type="button"
          onClick={() => setAbaAtiva("atendimento")}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            abaAtiva === "atendimento"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <FiClock className="h-4 w-4" />
          <span>Atendimento atual</span>
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva("pendencias")}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            abaAtiva === "pendencias"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <FiAlertCircle className="h-4 w-4" />
          <span>Senhas pendentes</span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              totalPendencias > 0
                ? "bg-status-warning-bg text-status-warning border-status-warning/30"
                : "bg-surface-muted text-text-secondary border-border"
            }`}
          >
            {totalPendencias}
          </span>
        </button>
      </div>

      {erroTriagem && (
        <div className="p-3 text-sm text-status-danger bg-status-danger-bg rounded-md border border-status-danger/30">
          {erroTriagem}
        </div>
      )}

      {erroPendencias && (
        <div className="p-3 text-sm text-status-danger bg-status-danger-bg rounded-md border border-status-danger/30">
          {erroPendencias}
        </div>
      )}

      {abaAtiva === "atendimento" && (
        <div className="flex flex-col gap-6">
          <AtendimentoActions
            senhaAtual={senhaAtual}
            fase={fase}
            carregando={carregandoTriagem}
            podeFinalizar={podeFinalizar}
            onIniciar={iniciar}
            onRechamar={rechamar}
            onFinalizar={handleFinalizar}
          />

          <div className="bg-surface rounded-lg border border-border p-6 shadow-xs flex flex-col gap-6">
            <BuscarAlunos
              onSelecionarAluno={handleSelecionarAluno}
              onNovoAluno={handleNovoAluno}
              disabled={fase !== "iniciada"}
            />

            <div className="border-t border-border/80 pt-6">
              <DadosAlunoForm
                dados={dadosAluno}
                onChange={handleChangeCampo}
                erros={erros}
                disabled={fase !== "iniciada"}
                cursos={cursos}
              />
            </div>

            <div className="border-t border-border/80 pt-6">
              <DocumentosPendentes
                documentosSelecionados={documentosSelecionados}
                onChange={setDocumentosSelecionados}
                onSalvarPendencia={handleSalvarPendencia}
                salvando={salvandoPendencia}
                disabled={fase !== "iniciada"}
              />
            </div>
          </div>
        </div>
      )}

      {abaAtiva === "pendencias" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface rounded-lg border border-border p-5 shadow-xs">
            <PendenciasGrid
              pendencias={pendencias}
              pendenciaSelecionada={pendenciaSelecionada}
              onSelecionarPendencia={selecionarPendencia}
              desabilitada={carregandoPendencias}
            />
          </div>

          <div className="lg:col-span-1">
            <DetalhePendencia
              pendencia={pendenciaSelecionada}
              onRetomar={handleRetomar}
              temSenhaAtual={Boolean(senhaAtual)}
              retomando={carregandoPendencias}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TriagemMain;
