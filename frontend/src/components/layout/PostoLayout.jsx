// Estrutura comum dos postos: coordena a fila, a senha atual e os estados visuais do atendimento.
import Alert from "../ui/Alert";
import { useAtendimento } from "../../hooks/useAtendimento";
import { useFila } from "../../hooks/useFila";
import { useSenhaAtual } from "../../hooks/useSenhaAtual";
import Header from "./Header";
import SidePostos from "./SidePostos";

const PostoLayout = ({ etapa, children }) => {
  const { carregando, erro, setErro } = useAtendimento();
  const { senhasAguardando, carregandoFila, erroFila, limparErroFila, carregarFila } = useFila(etapa);
  const { senhaAtual, chamarSenha, alterarPrioridade } = useSenhaAtual(etapa);

  // Reserva a senha escolhida e atualiza a lista com a confirmação do backend.
  const handleSelecionarSenha = async (senhaSelecionada) => {
    try {
      await chamarSenha(senhaSelecionada.id);
      await carregarFila({ silencioso: true });
    } catch {
      // O hook registra a mensagem no contexto; o alerta abaixo a apresenta.
    }
  };

  // Alterna a prioridade da senha atual; a atualização visual fica no hook específico.
  const handleAlternarPrioridade = async () => {
    try {
      await alterarPrioridade();
    } catch {
      // O hook registra a mensagem no contexto; o alerta abaixo a apresenta.
    }
  };

  const ocupado = carregando || carregandoFila;

  return (
    <div className="flex h-screen" aria-label={`Posto de ${etapa}`}>
      <SidePostos
        pessoasEsperando={senhasAguardando.length}
        senhasAguardando={senhasAguardando}
        senhaAtual={senhaAtual}
        onSelecionarSenha={handleSelecionarSenha}
        onAlternarPrioridade={handleAlternarPrioridade}
        carregando={ocupado}
      />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto bg-page p-4">
          {ocupado && <Alert type="info" message="Carregando atendimento..." />}
          {(erro || erroFila) && (
            <Alert
              type="error"
              message={erro ?? erroFila}
              onClose={() => {
                setErro(null);
                limparErroFila();
              }}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default PostoLayout;
