// Hook da fila: carrega a fila e o histórico diário, e reserva a senha escolhida.
import { useCallback, useEffect, useState } from "react";
import { chamarSenhaSelecionada /*, listarChamadasHoje*/, listarFila } from "../services/filaService";

export const useFila = (etapa) => {
  const [senhasAguardando, setSenhasAguardando] = useState([]);
  const [senhasChamadasHoje, setSenhasChamadasHoje] = useState([]);
  const [carregandoFila, setCarregandoFila] = useState(true);
  const [erroFila, setErroFila] = useState(null);

  // Atualiza as duas listas da lateral para refletir a fonte de verdade da API.
  const carregarFila = useCallback(async () => {
    try {
      setCarregandoFila(true);
      //! const [aguardando, historico] = await Promise.all([listarFila(etapa), listarChamadasHoje(etapa)]);
      const aguardando = await listarFila(etapa);
      setSenhasAguardando(aguardando);
      setSenhasChamadasHoje([]);
      setErroFila(null);
    } catch (erro) {
      setErroFila(erro.message);
    } finally {
      setCarregandoFila(false);
    }
  }, [etapa]);

  // Carrega dados novamente sempre que o posto exibido mudar.
  useEffect(() => {
    void Promise.resolve().then(carregarFila);
  }, [carregarFila]);

  // Reserva a senha clicada e a remove da fila somente após confirmação do backend.
  const chamar = async (senhaId) => {
    const senha = await chamarSenhaSelecionada(senhaId, etapa);
    setSenhasAguardando((atuais) => atuais.filter((item) => item.id !== senha?.id));
    setSenhasChamadasHoje((atuais) =>
      atuais.some((item) => item.id === senha?.id) ? atuais : [senha, ...atuais],
    );
    return senha;
  };

  return {
    senhasAguardando,
    senhasChamadasHoje,
    carregandoFila,
    erroFila,
    limparErroFila: () => setErroFila(null),
    carregarFila,
    chamar,
  };
};
