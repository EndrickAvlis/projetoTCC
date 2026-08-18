import * as React from "react";
import { buscarConfiguracaoArmario } from "../services/ProdutosService";

export const useArmario = () => {
  const [armario, setArmario] = React.useState(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarArmario = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const res = await buscarConfiguracaoArmario();
      setArmario(res.produto ?? null);
    } catch (error) {
      if (error.code === "ARMARIO_NAO_CONFIGURADO") {
        setArmario(null);
        return;
      }
      setArmario(null);
      setErro(error.message);
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
    erro,
    recarregar: carregarArmario,
  };
};
