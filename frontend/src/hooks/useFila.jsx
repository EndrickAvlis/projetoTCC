// Hook da fila: mantém na tela os dados retornados pelo filaService.
import { useCallback, useEffect, useState } from "react";
import {
  cancelarSenha,
  chamarProximaSenha,
  listarFila,
  rechamarSenha,
} from "../services/filaService";

export const useFila = (etapa) => {
  const [senhasAguardando, setSenhasAguardando] = useState([]);
  const [carregandoFila, setCarregandoFila] = useState(true);
  const [erroFila, setErroFila] = useState(null);

  const carregarFila = useCallback(async () => {
    try {
      setCarregandoFila(true);
      setSenhasAguardando(await listarFila(etapa));
      setErroFila(null);
    } catch (erro) {
      setErroFila(erro.message);
      setSenhasAguardando([]);
    } finally {
      setCarregandoFila(false);
    }
  }, [etapa]);

  useEffect(() => {
    let ativo = true;

    // A primeira consulta respeita o ciclo de vida da tela para evitar atualizações tardias.
    listarFila(etapa)
      .then((senhas) => {
        if (!ativo) return;
        setSenhasAguardando(senhas);
        setErroFila(null);
      })
      .catch((erro) => {
        if (!ativo) return;
        setErroFila(erro.message);
        setSenhasAguardando([]);
      })
      .finally(() => {
        if (ativo) setCarregandoFila(false);
      });

    return () => {
      ativo = false;
    };
  }, [etapa]);

  const chamar = async () => {
    const senha = await chamarProximaSenha(etapa);
    setSenhasAguardando((atuais) =>
      atuais.filter((item) => item.id !== senha?.id),
    );
    return senha;
  };

  const rechamar = (senhaId) => rechamarSenha(senhaId);

  const cancelar = async (senhaId, motivo) => {
    const senha = await cancelarSenha(senhaId, motivo);
    await carregarFila();
    return senha;
  };

  return {
    senhasAguardando,
    carregandoFila,
    erroFila,
    limparErroFila: () => setErroFila(null),
    carregarFila,
    chamar,
    rechamar,
    cancelar,
  };
};
