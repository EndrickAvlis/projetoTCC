import { requisitarApi } from "../../../services/apiClient";

const criarUrlCurso = (cursoId) =>
  `/admin/cursos/${encodeURIComponent(cursoId)}`;
const criarUrlOferta = (cursoId, ofertaId) =>
  `${criarUrlCurso(cursoId)}/ofertas/${encodeURIComponent(ofertaId)}`;

export const listarCursosAdmin = ({ busca = "", arquivado = false } = {}) => {
  const params = new URLSearchParams({ arquivado: String(arquivado) });

  const buscaNormalizada = busca.trim();

  if (buscaNormalizada) {
    params.set("busca", buscaNormalizada);
  }

  return requisitarApi(`/admin/cursos?${params.toString()}`);
};

export const criarCurso = (dados) =>
  requisitarApi("/admin/cursos", {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const atualizarNomeCurso = (cursoId, nome) =>
  requisitarApi(criarUrlCurso(cursoId), {
    method: "PATCH",
    body: JSON.stringify({ nome }),
  });

export const alterarArquivamentoCurso = (cursoId, arquivado) =>
  requisitarApi(`${criarUrlCurso(cursoId)}/arquivamento`, {
    method: "PATCH",
    body: JSON.stringify({ arquivado }),
  });

export const criarOfertaCurso = (cursoId, dados) =>
  requisitarApi(`${criarUrlCurso(cursoId)}/ofertas`, {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const atualizarOfertaCurso = (cursoId, ofertaId, dados) =>
  requisitarApi(criarUrlOferta(cursoId, ofertaId), {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
