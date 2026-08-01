// Estrutura comum dos postos: reserva a senha selecionada e entrega os dados à tela da etapa.
import Alert from "../ui/Alert";
import { useAtendimento } from "../../hooks/useAtendimento";
import { useFila } from "../../hooks/useFila";
import { obterDetalheSenha } from "../../services/atendimentoService";
import { atualizarPrioridadeSenha } from "../../services/filaService";
import Header from "./Header";
import SidePostos from "./SidePostos";

const PostoLayout = ({ etapa, children }) => {
  const { senhaAtual, setSenhaAtual, carregando, erro, setErro, setCarregando, exibirDetalheSenha } = useAtendimento();
  const { senhasAguardando, senhasChamadasHoje, carregandoFila, erroFila, limparErroFila, chamar } = useFila(etapa);

  // Chama exatamente a senha clicada e carrega seu detalhe; na Triagem o detalhe pode não ter aluno.
  const handleSelecionarSenha = async (senhaSelecionada) => {
    try {
      setCarregando(true);
      const senha = await chamar(senhaSelecionada.id);
      if (!senha) return;

      setSenhaAtual(senha);
      exibirDetalheSenha(await obterDetalheSenha(senha.id));
      setErro(null);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  };

  // Persiste a prioridade na API e substitui a senha atual pela versão confirmada pelo servidor.
  const handleAlternarPrioridade = async (tipoSenha) => {
    if (!senhaAtual) return;

    try {
      setCarregando(true);
      setSenhaAtual(await atualizarPrioridadeSenha(senhaAtual.id, tipoSenha));
      setErro(null);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  };

  const ocupado = carregando || carregandoFila;

  return (
    <div className="flex h-screen" aria-label={`Posto de ${etapa}`}>
      <SidePostos
        pessoasEsperando={senhasAguardando.length}
        senhasAguardando={senhasAguardando}
        senhasChamadasHoje={senhasChamadasHoje}
        senhaAtual={senhaAtual}
        onSelecionarSenha={handleSelecionarSenha}
        onAlternarPrioridade={handleAlternarPrioridade}
        carregando={ocupado}
      />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center flex-col gap-4">
          {/* {ocupado && <Alert type="info" message="Carregando atendimento..." />} */}
          {/* {(erro || erroFila) && <Alert type="error" message={erro ?? erroFila} onClose={() => { setErro(null); limparErroFila(); }} />} */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default PostoLayout;
