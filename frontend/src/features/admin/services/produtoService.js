import { requisitarApi } from "../../../services/apiClient";

export const listarProdutos = (params) =>
  requisitarApi("/produtos", { params });

export const criarProduto = (dados) =>
  requisitarApi("/produtos", {
    method: "POST",
    body: dados,
  });

export const atualizarProduto = (produtoId, dados) =>
  requisitarApi(`/produtos/${produtoId}`, {
    method: "PATCH",
    body: dados,
  });

export const atualizarEstoque = (produtoId, dados) =>
  requisitarApi(`/produtos/${produtoId}/estoque`, {
    method: "PATCH",
    body: dados,
  });

export const excluirProduto = (produtoId) =>
  requisitarApi(`/produtos/${produtoId}`, {
    method: "DELETE",
  });
