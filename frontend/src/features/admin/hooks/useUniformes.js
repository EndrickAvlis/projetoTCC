import * as React from "react";
import { listarProdutos } from "../services/produtoService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useUniformes = ({ busca = "", arquivado = false } = {}) => {
  const buscaDebounced = useDebounce(busca, 300);
  const [uniformes, setUniformes] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);

  const carregarUniformes = React.useCallback(async () => {
    setCarregando(true);

    try {
      const res = await listarProdutos({
        tipo: "uniforme",
        status: !arquivado,
        busca: buscaDebounced || undefined,
      });

      setUniformes(res.produtos ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setUniformes([]);
      setTotal(0);
    } finally {
      setCarregando(false);
    }
  }, [buscaDebounced, arquivado]);

  React.useEffect(() => {
    void Promise.resolve().then(carregarUniformes);
  }, [carregarUniformes]);

  return {
    uniformes,
    total,
    carregando,
    recarregar: carregarUniformes,
  };
};
