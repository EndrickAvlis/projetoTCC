import * as React from "react";
import { listarProdutos } from "../services/produtoService";

export const useArmario = () => {
  const [armario, setArmario] = React.useState(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarArmario = React.useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) setCarregando(true);
      setErro(null);

      try {
        const res = await listarProdutos({ tipo: "armario" });
        setArmario(res.produtos?.[0] ?? null);
      } catch (err) {
        setArmario(null);
        setErro(err.message);
      } finally {
        if (!silencioso) setCarregando(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void Promise.resolve().then(carregarArmario);
  }, [carregarArmario]);

  return {
    armario,
    carregando,
    erro,
    recarregar: carregarArmario,
  };
};

export default useArmario;
