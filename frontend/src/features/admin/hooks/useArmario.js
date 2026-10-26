import * as React from "react";
import { listarProdutos } from "../services/produtoService";

export const useArmario = () => {
  const [armario, setArmario] = React.useState(null);
  const [carregando, setCarregando] = React.useState(true);

  const carregarArmario = React.useCallback(async () => {
    setCarregando(true);

    try {
      const res = await listarProdutos({ tipo: "armario" });
      setArmario(res.produtos?.[0] ?? null);
    } catch {
      setArmario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(carregarArmario);
  }, [carregarArmario]);

  return {
    armario,
    carregando,
    recarregar: carregarArmario,
  };
};
