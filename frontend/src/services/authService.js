import { requisitarApi } from "./apiClient";

export const logar = (credenciais) =>
  requisitarApi("/auth/login", {
    method: "POST",
    body: credenciais,
  });

export const obterSessao = () => requisitarApi("/auth/me");

export const renovarSessao = () =>
  requisitarApi("/auth/refresh", {
    method: "POST",
  });

export const deslogar = () =>
  requisitarApi("/auth/logout", {
    method: "POST",
  });