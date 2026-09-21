import * as React from "react";
import { buscarAlunos } from "../services/TriagemService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useBuscaAlunos = ({ limite = 5 } = {}) => {
  const [busca, setBusca] = React.useState("");
  const [alunos, setAlunos] = React.useState([]);
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState(null);

  const buscaDebounced = useDebounce(busca, 300);
  const requisicaoRef = React.useRef(0);

  const carregarAlunos = React.useCallback(async () => {
    const nome = buscaDebounced.trim();

    if (nome.length < 2) {
      setAlunos([]);
      setErro(null);
      setCarregando(false);
      return;
    }

    const requisicaoId = ++requisicaoRef.current;
    setCarregando(true);
    setErro(null);

    try {
      const res = await buscarAlunos(nome, limite);
      if (requisicaoId === requisicaoRef.current) {
        setAlunos(res);
      }
    } catch (error) {
      if (requisicaoId === requisicaoRef.current) {
        setAlunos([]);
        setErro(error.message || "Erro ao buscar alunos");
      }
    } finally {
      if (requisicaoId === requisicaoRef.current) {
        setCarregando(false);
      }
    }
  }, [buscaDebounced, limite]);

  React.useEffect(() => {
    void Promise.resolve().then(carregarAlunos);
  }, [carregarAlunos]);

  const limparBusca = React.useCallback(() => {
    setBusca("");
    setAlunos([]);
    setErro(null);
    setCarregando(false);
  }, []);

  return {
    busca,
    setBusca,
    alunos,
    carregando,
    erro,
    limparBusca,
  };
};
