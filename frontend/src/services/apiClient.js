// Cliente HTTP central: adiciona URL, token, headers e tratamento padrão de erros.
const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
const AUTH_STORAGE_KEY = "tcc.auth";

//Essa classe é utilizada para obter erros, utilizando ApiError e passando 
// a message, junto com status(401), code(nome dado ao erro) e se quiser datils,
//você pode imprimir as especificasções de um erro retornado péla Api
export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

//Variavel capaz de obter as informações de um token de usuario
const obterToken = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))?.token ?? null;
  } catch {
    return null;
  }
};

// pega a resposta da Api e traduz para o frontend entender em json oiu texto simples
const lerResposta = async (resposta) => {
  if (resposta.status === 204) return null;

  const tipo = resposta.headers.get("content-type") ?? "";
  return tipo.includes("application/json")
    ? resposta.json()
    : resposta.text();
};

// função principal, ela faz o feach ao receber a rota desejada e as opçõesdessa rota como:
// method, body, headers e autenticada.
export const requisitarApi = async (
  rota,
  { autenticada = true, headers = {}, ...opcoes } = {},
) => {
  const token = autenticada ? obterToken() : null;
  const corpoEhFormData =
    typeof FormData !== "undefined" && opcoes.body instanceof FormData;
  const cabecalhos = {
    ...(!corpoEhFormData && opcoes.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  let resposta;

  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      ...opcoes,
      headers: cabecalhos,
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor.", {
      code: "API_INDISPONIVEL",
    });
  }

  const corpo = await lerResposta(resposta);

  if (!resposta.ok) {
    if (resposta.status === 401) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    throw new ApiError(
      (typeof corpo === "string" && corpo) ||
        corpo?.message ||
        corpo?.mensagem ||
        "Não foi possível concluir a solicitação.",
      {
        status: resposta.status,
        code: corpo?.code,
        details: corpo?.details,
      },
    );
  }

  return corpo;
};

export const obterUrlApi = () => API_URL;
