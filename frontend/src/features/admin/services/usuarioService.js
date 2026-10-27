import { requisitarApi } from "../../../services/apiClient";

export const listarUsuarios = (params) =>
  requisitarApi("/usuarios", { params });

export const criarUsuario = (dados) =>
  requisitarApi("/usuarios", {
    method: "POST",
    body: dados,
  });

export const atualizarUsuario = (usuarioId, dados) =>
  requisitarApi(`/usuarios/${usuarioId}`, {
    method: "PATCH",
    body: dados,
  });

export const excluirUsuario = (usuarioId) =>
  requisitarApi(`/usuarios/${usuarioId}`, {
    method: "DELETE",
  });