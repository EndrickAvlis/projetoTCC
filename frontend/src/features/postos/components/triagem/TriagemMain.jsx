import * as React from "react";
import { FiClock, FiAlertCircle } from "react-icons/fi";
import { useToast } from "../../../../context/toastContext";
import { useAtendimento } from "../../context/atendimentoContext";
import { usePendencias } from "../../hooks/usePendencias";
import * as TriagemService from "../../services/triagemService";
import AtendimentoActions from "../../layout/AtendimentoActions";
import BuscarAlunos from "./BuscarAlunos";
import DadosAlunoForm from "./DadosAlunoForm";
import DocumentosPendentes from "./DocumentosPendentes";
import PendenciasGrid from "./PendenciasGrid";
import DetalhePendencia from "./DetalhePendencia";
import Tabs from "../../../../components/ui/Tabs";

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

const formatarParaTexto = (valor, padrao = "") => valor?.toString() ?? padrao;

export const formPayload = (aluno) => ({
  nome: formatarParaTexto(aluno?.nome),
  cidade: formatarParaTexto(aluno?.cidade),
  sexo: formatarParaTexto(aluno?.sexo),
  escolaridadePublica: formatarParaTexto(aluno?.escolaridadePublica),
  classificacao: formatarParaTexto(aluno?.classificacao),
  curso: formatarParaTexto(aluno?.cursoId),
  periodo: formatarParaTexto(aluno?.periodo),
  ano: formatarParaTexto(aluno?.anoEscolar, "1"),
});

const validarDadosAluno = (dados) =>
  Boolean(
    dados.nome?.trim() &&
      dados.curso &&
      dados.periodo &&
      dados.ano &&
      dados.escolaridadePublica !== "" &&
      dados.sexo &&
      dados.cidade?.trim() &&
      Number(dados.classificacao) > 0,
  );

export const TriagemMain = () => {
  const toast = useToast();
  const {
    fase,
    senhaAtual,
    atendimentoAtual,
    carregando,
    finalizarAtendimento,
    limparAtendimento,
    setCarregando,
  } = useAtendimento();
  const {
    pendencias,
    total: totalPendencias,
    pendenciaSelecionada,
    selecionarPendencia,
    retomar,
    carregando: carregandoPendencias,
  } = usePendencias();

  const [abaAtiva, setAbaAtiva] = React.useState("atendimento");
  const [cursos, setCursos] = React.useState([]);
  const [alunoId, setAlunoId] = React.useState(null);
  const [dadosAluno, setDadosAluno] = React.useState(DADOS_INICIAIS);
  const [documentosSelecionados, setDocumentosSelecionados] = React.useState([]);

  React.useEffect(() => {
    const carregarCursos = async () => {
      try {
        const res = await TriagemService.listarCursos();
        setCursos(res.cursos);
      } catch {
        setCursos([]);
      }
    };

    carregarCursos();
  }, []);

  const handleSelecionarAluno = (aluno) => {
    setAlunoId(aluno.id);
    setDadosAluno(formPayload(aluno));
  };

  const handleLimparFormulario = () => {
    setAlunoId(null);
    setDadosAluno(DADOS_INICIAIS);
    setDocumentosSelecionados([]);
  };

  const handleChangeCampo = (campo, valor) => {
    setDadosAluno((prev) => ({
      ...prev,
      [campo]: valor,
      ...(campo === "curso" ? { periodo: "" } : {}),
    }));
  };

  const handleSalvarPendencia = async () => {
    if (!podeSalvarPendencia || !atendimentoAtual) return;

    try {
      setCarregando(true);
      await TriagemService.vincularAluno(senhaAtual.id, dadosAluno, alunoId);
      await TriagemService.registrarPendencia(
        atendimentoAtual.idHistorico,
        documentosSelecionados,
      );

      limparAtendimento();
      handleLimparFormulario();
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleFinalizar = async () => {
    try {
      setCarregando(true);
      await TriagemService.vincularAluno(senhaAtual.id, dadosAluno, alunoId);
      await finalizarAtendimento();
      handleLimparFormulario();
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleRetomar = async (senhaId) => {
    try {
      const res = await retomar(senhaId);
      if (res?.documentos) {
        setDocumentosSelecionados(res.documentos);
      }
      if (res?.senha?.aluno) {
        setAlunoId(res.senha.aluno.id);
        setDadosAluno(formPayload(res.senha.aluno));
      }
      setAbaAtiva("atendimento");
    } catch (erro) {
      toast.erro(erro.message);
    }
  };

  const alunoPreenchido = fase === "iniciada" && validarDadosAluno(dadosAluno);
  const podeFinalizar = alunoPreenchido && documentosSelecionados.length === 0;
  const podeSalvarPendencia =
    alunoPreenchido && documentosSelecionados.length > 0;

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
    <div className="w-full flex flex-col gap-6">
      <Tabs
        itens={abasTriagem}
        ativo={abaAtiva}
        onSelecionar={setAbaAtiva}
        ariaLabel="Abas da triagem"
      />

      {abaAtiva === "atendimento" && (
        <div className="flex flex-col gap-6">
          <AtendimentoActions
            podeFinalizar={podeFinalizar}
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
                podeSalvar={podeSalvarPendencia}
                salvando={carregando}
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
