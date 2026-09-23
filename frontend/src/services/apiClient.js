import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
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

let promisseRefresh = null;
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

      if (!promisseRefresh) {
        promisseRefresh = apiClient
          .post("/auth/refresh")
          .catch((falhouReq) => {
            window.dispatchEvent(new Event("auth:unauthorized"));
            return Promise.reject(falhouReq);
          })
          .finally(() => {
            promisseRefresh = null;
          });
      }

      await promisseRefresh;
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
    const res = error.response;
    const corpo = res?.data;
    throw new ApiError(
      corpo?.message ||
        corpo?.mensagem ||
        "Não foi possível concluir a solicitação.",
      {
        status: res?.status,
        code: corpo?.code,
        details: corpo?.details,
      },
    );
  }
};
