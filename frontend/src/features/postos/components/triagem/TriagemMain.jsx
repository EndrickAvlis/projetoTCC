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

const DADOS_INICIAIS = {
  nome: "",
  classificacao: "",
  curso: "",
  periodo: "",
  ano: "1",
  cidade: "",
  sexo: "",
  escolaridadePublica: "null",
};

export const TriagemMain = () => {
  const {
    fase,
    senhaAtual,
    iniciar,
    salvarDados,
    finalizar,
    salvarPendencia,
    rechamar,
    definirSenhaChamada,
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
  const [alunoId, setAlunoId] = React.useState(null);
  const [dadosAluno, setDadosAluno] = React.useState(DADOS_INICIAIS);
  const [documentosSelecionados, setDocumentosSelecionados] = React.useState([]);

  React.useEffect(() => {
    listarCursos().then(setCursos).catch(() => setCursos([]));
  }, []);

  const handleSelecionarAluno = (aluno) => {
    const matricula = aluno.matriculas?.[0];
    setAlunoId(aluno.id ?? null);
    setDadosAluno({
      nome: aluno.nome || "",
      classificacao: matricula?.classificacao ? String(matricula.classificacao) : "",
      curso: matricula?.cursoId ? String(matricula.cursoId) : "",
      periodo: matricula?.periodo || "",
      ano: matricula?.anoEscolar ? String(matricula.anoEscolar) : "1",
      cidade: aluno.cidade || "",
      sexo: aluno.sexo || "",
      escolaridadePublica: aluno.escolaridadePublica !== null ? String(aluno.escolaridadePublica) : "null",
    });
  };

  const handleLimparFormulario = () => {
    setAlunoId(null);
    setDadosAluno(DADOS_INICIAIS);
    setDocumentosSelecionados([]);
  };

  const handleChangeCampo = (campo, valor) => {
    setDadosAluno((prev) => ({ ...prev, [campo]: valor }));
  };

  const montarPayload = () => ({
    alunoId,
    dadosAluno: {
      nome: dadosAluno.nome.trim(),
      escolaridadePublica:
        dadosAluno.escolaridadePublica === "true"
          ? true
          : dadosAluno.escolaridadePublica === "false"
            ? false
            : null,
      cidade: dadosAluno.cidade.trim() || null,
      sexo: dadosAluno.sexo || null,
    },
    matricula: {
      cursoId: Number(dadosAluno.curso),
      classificacao: dadosAluno.classificacao ? Number(dadosAluno.classificacao) : null,
      periodo: dadosAluno.periodo,
      anoEscolar: Number(dadosAluno.ano),
    },
  });

  const handleSalvarPendencia = async () => {
    if (documentosSelecionados.length === 0) return;
    if (dadosAluno.nome.trim() && dadosAluno.curso) {
      await salvarDados(montarPayload());
    }
    await salvarPendencia(documentosSelecionados);
    handleLimparFormulario();
  };

  const handleFinalizar = async () => {
    await salvarDados(montarPayload());
    await finalizar();
    handleLimparFormulario();
  };

  const handleRetomar = async (senhaId) => {
    const res = await retomar(senhaId);
    if (res?.senha) {
      definirSenhaChamada(res.senha);
    }
    if (res?.documentos) {
      setDocumentosSelecionados(res.documentos);
    }
    setAbaAtiva("atendimento");
  };

  const podeFinalizar =
    fase === "iniciada" &&
    Boolean(dadosAluno.nome.trim()) &&
    Boolean(dadosAluno.curso) &&
    Boolean(dadosAluno.periodo) &&
    Boolean(dadosAluno.ano) &&
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

      {(erroTriagem || erroPendencias) && (
        <div className="p-3 text-sm text-status-danger bg-status-danger-bg rounded-md border border-status-danger/30">
          {erroTriagem || erroPendencias}
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
              onNovoAluno={handleLimparFormulario}
              disabled={fase !== "iniciada"}
            />

            <div className="border-t border-border/80 pt-6">
              <DadosAlunoForm
                dados={dadosAluno}
                onChange={handleChangeCampo}
                disabled={fase !== "iniciada"}
                cursos={cursos}
              />
            </div>

            <div className="border-t border-border/80 pt-6">
              <DocumentosPendentes
                documentosSelecionados={documentosSelecionados}
                onChange={setDocumentosSelecionados}
                onSalvarPendencia={handleSalvarPendencia}
                salvando={carregandoTriagem}
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
