import { requisitarApi } from "../../../services/apiClient";

const criarurlUsuario = (usuarioid) =>
  `/voluntarios/${encodeURIComponent(usuarioid)}`;

export const listarUsuarios = ({ busca = "", tipo = "", status = "" } = {}) => {
  const params = new URLSearchParams();
  const buscaLimpa = busca.trim();

  if (buscaLimpa) params.set("busca", buscaLimpa);
  if (tipo) params.set("tipo", tipo);
  if (status) params.set("status", status);

  const query = params.toString();
  return requisitarApi(`/voluntarios?${query ? `${query}` : ""}`);
};

export const criarUsuario = (dados) =>
  requisitarApi("/voluntarios", {
    method: "POST",
    body: dados,
  });

export const atualizarUsuario = (usuarioid, dados) =>
  requisitarApi(criarurlUsuario(usuarioid), {
    method: "PATCH",
    body: dados,
  });

export const alterarStatusUsuario = (usuarioid, status) =>
  requisitarApi(criarurlUsuario(usuarioid), {
    method: "PATCH",
    body: { status },
  });