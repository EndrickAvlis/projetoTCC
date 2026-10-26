import { requisitarApi } from "../../../services/apiClient";

export const listarProdutos = async () => {
  const [resUniformes, resArmario] = await Promise.all([
    requisitarApi("/produtos?tipo=uniforme&status=true"),
    requisitarApi("/produtos?tipo=armario&status=true"),
  ]);

  return {
    uniformes: resUniformes.produtos ?? [],
    armario: resArmario.produtos?.[0] ?? null,
  };
};

export const registrarVenda = async (dadosCompra) => {
  return requisitarApi("/compras", {
    method: "POST",
    body: dadosCompra,
  });
};
