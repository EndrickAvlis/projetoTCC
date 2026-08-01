// Serviço de autenticação: concentra login, restauração e encerramento de sessão.
import { requisitarApi } from "./apiClient";

export const autenticar = (credenciais) =>
  requisitarApi("/auth/login", {
    method: "POST",
    autenticada: false,
    body: JSON.stringify(credenciais),
  });

export const obterSessaoAtual = () => requisitarApi("/auth/me");

export const encerrarSessao = () =>
  requisitarApi("/auth/logout", { method: "POST" });
