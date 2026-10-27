import { requisitarApi } from "../../../services/apiClient";

export const dadosRelatorio = (params) => 
  requisitarApi("/relatorios/dados", { params });

export const detalheVenda = (id) => 
  requisitarApi(`/relatorios/detalhe/${id}`);

export const exportarRelatorio = (params) =>
  requisitarApi("/relatorios/exportar", { params, responseType: "blob" });
