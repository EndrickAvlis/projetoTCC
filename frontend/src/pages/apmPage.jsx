import SidePostos from "../components/layout/SidePostos";
import { useAtendimento } from "../context/atendimentoContext";
import { useFila } from "../hooks/useFila";
import Header from "../components/layout/Header";

const DocsPage = () => {
  const { senhaAtual, setSenhaAtual, atendendo, setAtendendo } =
    useAtendimento();
  const { chamarSenha, cancelarSenha, finalizarSenha, senhasAguardando } =
    useFila();

  // *Filtra as senhas pela etapa
  const senhasApm = senhasAguardando.filter((senha) => senha.etapa === "apm");

  // TODO: Requisição para o back slecionar a proxima senha a ser chamada e mudar o status dela para em_atendimento.
  const handleChamar = () => {
    const proxima = chamarSenha();
    if (!proxima) return;
    setSenhaAtual(proxima);
    setAtendendo(false);
  };

  // TODO: Requisição para o back no websocket.
  const handleRechamar = () => {
    console.log("Rechamando a senha:", senhaAtual.numero);
    // Backend - emitir notificação para painel TV
    // Pode ser via WebSocket (socket.emit('rechamar', { senha: senhaAtual }))
    // ou via endpoint POST /api/painel/rechamar
  };

  // TODO: Requisição para o back para cancelar a senha atual pelo id.
  const handleCancelar = () => {
    cancelarSenha(senhaAtual);
    setSenhaAtual(null);
  };

  return (
    <div className="flex h-screen">
      <SidePostos
        pessoasEsperando={senhasApm.length}
        proximasSenhas={senhasApm}
        senhaAtual={senhaAtual}
        podeChamar={!senhaAtual}
        podeRechamar={!!senhaAtual}
        podeCancelar={!!senhaAtual}
        onChamar={handleChamar}
        onRechamar={handleRechamar}
        onCancelar={handleCancelar}
      />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header />
        {/*Content*/}
        <main className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center flex-col">
          {/* Painel de vendas */}
          {/* Painel de resumo da compra */}
        </main>
      </div>
    </div>
  );
};

export default DocsPage;