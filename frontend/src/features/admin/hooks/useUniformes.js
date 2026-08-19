import * as React from "react";
import { listarUniformesAdmin } from "../services/ProdutosService";

export const useUniformes = ({ busca = "", arquivado = false } = {}) => {
  const [uniformes, setUniformes] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarUniformes = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const res = await listarUniformesAdmin({ busca, arquivado });

      setUniformes(res.produtos ?? []);
      setTotal(res.total ?? 0);
    } catch (error) {
      setUniformes([]);
      setTotal(0);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [busca, arquivado]);

  React.useEffect(() => {
    carregarUniformes();
  }, [carregarUniformes]);

  return {
    uniformes,
    total,
    carregando,
    erro,
    recarregar: carregarUniformes,
  };
};
