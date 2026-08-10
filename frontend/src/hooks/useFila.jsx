// Hook de leitura da fila: busca e atualiza somente as senhas aguardando da etapa.
import { useCallback, useEffect, useState } from "react";
import { listarFila } from "../services/filaService";

const INTERVALO_ATUALIZACAO_MS = 5000;

export const useFila = (etapa) => {
  const [senhasAguardando, setSenhasAguardando] = useState([]);
  const [carregandoFila, setCarregandoFila] = useState(true);
  const [erroFila, setErroFila] = useState(null);

  // Consulta a fonte de verdade da API e substitui a lista local pela resposta recebida.
  const carregarFila = useCallback(async ({ silencioso = false } = {}) => {
    try {
      if (!silencioso) setCarregandoFila(true);

      setSenhasAguardando(await listarFila(etapa));
      setErroFila(null);
    } catch (erro) {
      setErroFila(erro.message);
    } finally {
      if (!silencioso) setCarregandoFila(false);
    }
  }, [etapa]);

  // Carrega a fila ao abrir o posto e a sincroniza periodicamente para outros atendentes.
  useEffect(() => {
    void Promise.resolve().then(carregarFila);
    const intervalo = window.setInterval(
      () => void carregarFila({ silencioso: true }),
      INTERVALO_ATUALIZACAO_MS,
    );

    return () => window.clearInterval(intervalo);
  }, [carregarFila]);

  // Remove a mensagem de erro depois que ela é apresentada ao atendente.
  const limparErroFila = () => setErroFila(null);

  return {
    senhasAguardando,
    carregandoFila,
    erroFila,
    limparErroFila,
    carregarFila,
  };
};
