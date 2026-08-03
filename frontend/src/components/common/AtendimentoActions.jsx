// Botões reutilizados para iniciar e finalizar um atendimento.
import Button from "../ui/Button";
import { useAtendimento } from "../../hooks/useAtendimento";
import {
  finalizarAtendimento,
  iniciarAtendimento,
} from "../../services/atendimentoService";

const AtendimentoActions = ({
  podeFinalizar = true,
  onFinalizar,
  textoFinalizar = "Finalizar Atendimento",
  textoIniciar = "Iniciar Atendimento",
}) => {
  const {
    senhaAtual,
    atendendo,
    atendimentoAtual,
    setAtendendo,
    setAtendimentoAtual,
    setCarregando,
    setErro,
    limparAtendimentoExibido,
  } = useAtendimento();

  const handleIniciar = async () => {
    if (!senhaAtual) return;

    try {
      setCarregando(true);
      const resposta = await iniciarAtendimento(senhaAtual.id);
      if (!resposta?.atendimento?.id) {
        throw new Error("A API não retornou o atendimento iniciado.");
      }
      setAtendimentoAtual(resposta.atendimento);
      setAtendendo(true);
      setErro(null);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleFinalizar = async () => {
    if (!atendimentoAtual) return;

    try {
      setCarregando(true);
      const resultado = onFinalizar
        ? await onFinalizar(atendimentoAtual.id)
        : await finalizarAtendimento(atendimentoAtual.id);

      if (resultado === false) return;
      limparAtendimentoExibido();
      setErro(null);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex gap-4 justify-between">
      <Button
        className="w-75 bg-primary hover:bg-primary-hover"
        disabled={!senhaAtual || atendendo}
        onClick={handleIniciar}
        size="lg"
      >
        {textoIniciar}
      </Button>
      <Button
        variant="success"
        className="w-75"
        disabled={!atendendo || !atendimentoAtual || !podeFinalizar}
        onClick={handleFinalizar}
        size="lg"
      >
        {textoFinalizar}
      </Button>
    </div>
  );
};

export default AtendimentoActions;
