import axios from "axios";

export const API_URL = (
  import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000`
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const CHAVE_ACCESS_TOKEN = "siga_access_token";
const CHAVE_REFRESH_TOKEN = "siga_refresh_token";

export const obterAccessToken = () =>
  window.sessionStorage.getItem(CHAVE_ACCESS_TOKEN);

export const obterRefreshToken = () =>
  window.sessionStorage.getItem(CHAVE_REFRESH_TOKEN);

export const salvarTokensSessao = ({ accessToken, refreshToken } = {}) => {
  if (accessToken) {
    window.sessionStorage.setItem(CHAVE_ACCESS_TOKEN, accessToken);
  }
  if (refreshToken) {
    window.sessionStorage.setItem(CHAVE_REFRESH_TOKEN, refreshToken);
  }
};

export const limparTokensSessao = () => {
  window.sessionStorage.removeItem(CHAVE_ACCESS_TOKEN);
  window.sessionStorage.removeItem(CHAVE_REFRESH_TOKEN);
};

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = obterAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let promiseRefresh = null;
apiClient.interceptors.response.use(
  (res) => res,
  async (erro) => {
    const dadosReq = erro.config;

    if (
      erro.response?.status === 401 &&
      !dadosReq._retry &&
      !dadosReq.url?.includes("/auth/login") &&
      !dadosReq.url?.includes("/auth/refresh")
    ) {
      dadosReq._retry = true;

      if (
        erro.response?.data?.code === "USUARIO_DESATIVADO" ||
        erro.response?.data?.code === "PERMISSAO_ALTERADA"
      ) {
        limparTokensSessao();
        window.dispatchEvent(
          new CustomEvent("auth:unauthorized", {
            detail: { message: erro.response.data.message },
          }),
        );
        return Promise.reject(erro);
      }

      if (!promiseRefresh) {
        const refreshToken = obterRefreshToken();
        promiseRefresh = apiClient
          .post("/auth/refresh", refreshToken ? { refreshToken } : undefined)
          .then((res) => {
            if (res?.data?.accessToken) {
              salvarTokensSessao({ accessToken: res.data.accessToken });
            }
            if (res?.data) {
              const usuario = { ...res.data };
              delete usuario.accessToken;
              window.dispatchEvent(
                new CustomEvent("auth:refreshed", { detail: usuario }),
              );
            }
            return res;
          })
          .catch((falhouReq) => {
            limparTokensSessao();
            const code = falhouReq.response?.data?.code;
            const message =
              code === "USUARIO_DESATIVADO" ||
              code === "CREDENCIAIS_INSUFICIENTES"
                ? falhouReq.response.data.message
                : "";

            window.dispatchEvent(
              new CustomEvent("auth:unauthorized", {
                detail: message ? { message } : undefined,
              }),
            );
            return Promise.reject(falhouReq);
          })
          .finally(() => {
            promiseRefresh = null;
          });
      }

      await promiseRefresh;
      if (dadosReq.headers) {
        delete dadosReq.headers.Authorization;
      }
      return apiClient(dadosReq);
    }

    return Promise.reject(erro);
  },
);

export const requisitarApi = async (
  rota,
  { method = "GET", headers = {}, body, ...opcoes } = {},
) => {
  try {
    const res = await apiClient.request({
      url: rota,
      method,
      headers,
      data: body,
      ...opcoes,
    });
    return res.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const res = error.response;
    const corpo = res?.data;

    const message =
      corpo?.details?.[0]?.message ||
      corpo?.message ||
      (!res && error.request
        ? "Sem conexão com o servidor."
        : "Não foi possível concluir a solicitação.");

    throw new ApiError(message, {
      status: res?.status,
      code: corpo?.code,
      details: corpo?.details,
    });
  }
};

