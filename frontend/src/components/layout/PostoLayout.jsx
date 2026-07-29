// Estrutura comum dos postos: fila lateral, cabeçalho, conteúdo e erros.
import Alert from "../ui/Alert";
import { useAtendimento } from "../../hooks/useAtendimento";
import { useFila } from "../../hooks/useFila";
import { obterDetalheSenha } from "../../services/atendimentoService";
import Header from "./Header";
import SidePostos from "./SidePostos";

const PostoLayout = ({ etapa, children }) => {
  const {
    senhaAtual,
    setSenhaAtual,
    carregando,
    erro,
    setErro,
    setCarregando,
    exibirDetalheSenha,
    limparAtendimentoExibido,
  } = useAtendimento();
  const {
    senhasAguardando,
    carregandoFila,
    erroFila,
    limparErroFila,
    chamar,
    rechamar,
    cancelar,
  } = useFila(etapa);

  const handleChamar = async () => {
    try {
      setCarregando(true);
      const senha = await chamar();
      if (!senha) return;

      // Mantém a senha bloqueada na tela mesmo se a consulta de detalhe falhar.
      setSenhaAtual(senha);
      exibirDetalheSenha(await obterDetalheSenha(senha.id));
      setErro(null);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleRechamar = async () => {
    if (!senhaAtual) return;

    try {
      setCarregando(true);
      await rechamar(senhaAtual.id);
      setErro(null);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleCancelar = async () => {
    if (!senhaAtual) return;

    try {
      setCarregando(true);
      await cancelar(senhaAtual.id);
      limparAtendimentoExibido();
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
        proximasSenhas={senhasAguardando}
        senhaAtual={senhaAtual}
        podeChamar={!ocupado && !senhaAtual}
        podeRechamar={!ocupado && Boolean(senhaAtual)}
        podeCancelar={!ocupado && Boolean(senhaAtual)}
        onChamar={handleChamar}
        onRechamar={handleRechamar}
        onCancelar={handleCancelar}
      />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center flex-col gap-4">
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
