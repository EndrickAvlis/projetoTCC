import { requisitarApi } from "../../../services/apiClient";

export const obterKpis = () =>
  requisitarApi("/secretaria");

export const listarPendencias = (params) =>
  requisitarApi("/secretaria/pendencias", { params });

export const registrarRetirada = (compraId, itens) =>
  requisitarApi(`/secretaria/retiradas/${compraId}`, {
    method: "POST",
    body: { itens },
  });

export const registrarVenda = (dados) =>
  requisitarApi("/secretaria/vendas", {
    method: "POST",
    body: dados,
  });
