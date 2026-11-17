import {
  requisitarApi,
  salvarTokensSessao,
  limparTokensSessao,
  obterRefreshToken,
} from "./apiClient";

const extrairUsuario = (dados) => {
  const usuario = { ...dados };
  delete usuario.accessToken;
  delete usuario.refreshToken;
  return usuario;
};

export const logar = async (credenciais) => {
  const dados = await requisitarApi("/auth/login", {
    method: "POST",
    body: credenciais,
  });
  salvarTokensSessao(dados);
  return extrairUsuario(dados);
};

export const obterSessao = () => requisitarApi("/auth/me");

export const renovarSessao = async () => {
  const refreshToken = obterRefreshToken();
  const dados = await requisitarApi("/auth/refresh", {
    method: "POST",
    body: refreshToken ? { refreshToken } : undefined,
  });
  salvarTokensSessao(dados);
  return extrairUsuario(dados);
};

export const deslogar = async () => {
  try {
    await requisitarApi("/auth/logout", {
      method: "POST",
    });
  } finally {
    limparTokensSessao();
  }
};