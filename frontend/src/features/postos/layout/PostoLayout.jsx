import Alert from "../../../components/ui/Alert";
import { useAtendimento } from "../../../hooks/useAtendimento";
import { useFila } from "../../../hooks/useFila";
import { useSenhaAtual } from "../../../hooks/useSenhaAtual";
import Header from "../../../components/layout/Header";
import SidePostos from "./SidePostos";

const PostoLayout = ({ etapa, children }) => {
  const { carregando, erro, setErro } = useAtendimento();
  const {
    senhasAguardando,
    carregandoFila,
    erroFila,
    limparErroFila,
    carregarFila,
  } = useFila(etapa);
  const { senhaAtual, chamarSenha, alterarPrioridade } = useSenhaAtual(etapa);

  const handleSelecionarSenha = async (senhaSelecionada) => {
    try {
      await chamarSenha(senhaSelecionada.id);
      await carregarFila({ silencioso: true });
    } catch (erro) {
      void erro;
    }
  };

  const handleAlternarPrioridade = async () => {
    try {
      await alterarPrioridade();
    } catch (erro) {
      void erro;
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
        <main className="flex flex-1 flex-col items-center justify-start gap-4 overflow-auto bg-page p-4">
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
