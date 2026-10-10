import { requisitarApi } from "../../../services/apiClient";

export const listarProdutos = async () => {
  const [resUniformes, resArmario] = await Promise.all([
    requisitarApi("/produtos?tipo=uniforme&arquivado=false"),
    requisitarApi("/produtos/armario").catch(() => ({ armario: null })),
  ]);

  return {
    uniformes: resUniformes.uniformes,
    armario: resArmario.armario,
  };
};

export const registrarVenda = async (senhaId, compra) => {
  return requisitarApi("/atendimentos/apm/finalizar", {
    method: "POST",
    body: { senhaId, compra },
  });
};