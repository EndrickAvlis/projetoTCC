import * as React from "react";
import { listarUniformesAdmin } from "../services/ProdutosService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useUniformes = ({ busca = "", arquivado = false } = {}) => {
  const buscaDebounced = useDebounce(busca, 300);
  const [uniformes, setUniformes] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarUniformes = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const res = await listarUniformesAdmin({
        busca: buscaDebounced,
        arquivado,
      });

      setUniformes(res.produtos ?? []);
      setTotal(res.total ?? 0);
    } catch (error) {
      setUniformes([]);
      setTotal(0);
      setErro(error.message);
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
    erro,
    recarregar: carregarUniformes,
  };
};
