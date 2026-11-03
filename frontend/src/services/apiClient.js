import axios from "axios";

const API_URL = (
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

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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
        sessionStorage.setItem("alerta_sessao", erro.response.data.message);
        window.dispatchEvent(new Event("auth:unauthorized"));
        return Promise.reject(erro);
      }

      if (!promiseRefresh) {
        promiseRefresh = apiClient
          .post("/auth/refresh")
          .catch((falhouReq) => {
            if (
              falhouReq.response?.data?.code === "USUARIO_DESATIVADO" ||
              falhouReq.response?.data?.code === "CREDENCIAIS_INSUFICIENTES"
            ) {
              sessionStorage.setItem(
                "alerta_sessao",
                falhouReq.response.data.message,
              );
            }
            window.dispatchEvent(new Event("auth:unauthorized"));
            return Promise.reject(falhouReq);
          })
          .finally(() => {
            promiseRefresh = null;
          });
      }

      await promiseRefresh;
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

