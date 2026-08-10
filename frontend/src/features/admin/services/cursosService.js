import { requisitarApi } from "../../../services/apiClient";

const criarUrlCurso = (cursoId) =>
  `/admin/cursos/${encodeURIComponent(cursoId)}`;
const criarUrlPeriodo = (cursoId, periodoId) =>
  `${criarUrlCurso(cursoId)}/periodos/${encodeURIComponent(periodoId)}`;

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

export const criarPeriodoCurso = (cursoId, dados) =>
  requisitarApi(`${criarUrlCurso(cursoId)}/periodos`, {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const atualizarPeriodoCurso = (cursoId, periodoId, dados) =>
  requisitarApi(criarUrlPeriodo(cursoId, periodoId), {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
