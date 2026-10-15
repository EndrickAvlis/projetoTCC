import { requisitarApi } from "../../../services/apiClient";

const criarUrlUsuario = (usuarioId) =>
  `/voluntarios/${encodeURIComponent(usuarioId)}`;

const mapearUsuario = (usuario) => ({
  id: usuario.idVoluntario,
  nome: usuario.nomeVoluntario,
  tipo: usuario.tipoVoluntario,
  status: usuario.statusVoluntario,
});

export const listarUsuarios = async ({
  busca = "",
  tipo = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams();
  const buscaLimpa = busca.trim();

  if (buscaLimpa) params.set("busca", buscaLimpa);
  if (tipo) params.set("tipo", tipo);
  if (status !== "" && status !== undefined && status !== null) {
    params.set("status", String(status));
  }

  const query = params.toString();
  const res = await requisitarApi(`/voluntarios?${query ? `${query}` : ""}`);

  return {
    usuarios: (res?.usuarios ?? []).map(mapearUsuario),
    total: res?.total ?? 0,
  };
};

export const criarUsuario = (dados) =>
  requisitarApi("/voluntarios", {
    method: "POST",
    body: dados,
  });

export const atualizarUsuario = (usuarioId, dados) =>
  requisitarApi(criarUrlUsuario(usuarioId), {
    method: "PATCH",
    body: dados,
  });
