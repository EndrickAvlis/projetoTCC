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
import Tabs from "../../../../components/ui/Tabs";
import Alert from "../../../../components/ui/Alert";

const DADOS_INICIAIS = {
  nome: "",
  classificacao: "",
  curso: "",
  periodo: "",
  ano: "1",
  cidade: "",
  sexo: "",
  escolaridadePublica: "",
};

const alunoParaForm = (aluno) => {
  const matricula = aluno?.matriculas?.[0] || {};

  return {
    nome: aluno?.nome || "",
    cidade: aluno?.cidade || "",
    sexo: aluno?.sexo || "",
    escolaridadePublica: aluno?.escolaridadePublica ?? "",
    classificacao: matricula.classificacao ?? "",
    curso: matricula.cursoId ? String(matricula.cursoId) : "",
    periodo: matricula.periodo || "",
    ano: String(matricula.anoEscolar || "1"),
  };
};

const formParaPayload = (dados, alunoId) => ({
  alunoId,
  dadosAluno: {
    nome: dados.nome.trim(),
    cidade: dados.cidade.trim() || null,
    sexo: dados.sexo || null,
    escolaridadePublica:
      dados.escolaridadePublica === ""
        ? null
        : String(dados.escolaridadePublica) === "true",
  },
  matricula: {
    cursoId: Number(dados.curso),
    classificacao: dados.classificacao ? Number(dados.classificacao) : null,
    periodo: dados.periodo,
    anoEscolar: Number(dados.ano),
  },
});

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
    setAlunoId(aluno?.id ?? null);
    setDadosAluno(alunoParaForm(aluno));
  };

  const handleLimparFormulario = () => {
    setAlunoId(null);
    setDadosAluno(DADOS_INICIAIS);
    setDocumentosSelecionados([]);
  };

  const handleChangeCampo = (campo, valor) => {
    setDadosAluno((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSalvarPendencia = async () => {
    if (documentosSelecionados.length === 0) return;
    if (dadosAluno.nome.trim() && dadosAluno.curso) {
      await salvarDados(formParaPayload(dadosAluno, alunoId));
    }
    await salvarPendencia(documentosSelecionados);
    handleLimparFormulario();
  };

  const handleFinalizar = async () => {
    await salvarDados(formParaPayload(dadosAluno, alunoId));
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

  const podeFinalizar = Boolean(
    fase === "iniciada" &&
    dadosAluno.nome.trim() &&
    dadosAluno.curso &&
    dadosAluno.periodo &&
    dadosAluno.ano &&
    documentosSelecionados.length === 0
  );

  const abasTriagem = [
    { id: "atendimento", label: "Atendimento atual", icone: FiClock },
    {
      id: "pendencias",
      label: "Senhas pendentes",
      icone: FiAlertCircle,
      badge: totalPendencias,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 md:p-6">
      <Tabs
        itens={abasTriagem}
        ativo={abaAtiva}
        onSelecionar={setAbaAtiva}
        ariaLabel="Abas da triagem"
      />

      {(erroTriagem || erroPendencias) && (
        <Alert type="error" message={erroTriagem || erroPendencias} />
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