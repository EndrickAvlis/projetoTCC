import { requisitarApi } from "../../../services/apiClient";

const criarUrlAluno = (alunoId) => `/admin/alunos/${encodeURIComponent(alunoId)}`;

export const listarAlunosAdmin = ({
  busca = "",
  cursoId = "",
  status = "ATIVO",
  pagina = 1,
  limite = 10,
} = {}) => {
  const params = new URLSearchParams();

  const buscaLimpa = busca.trim();
  if (buscaLimpa) params.set("nome", buscaLimpa);
  if (cursoId) params.set("cursoId", cursoId);
  if (status) params.set("status", status);
  if (pagina) params.set("pagina", pagina);
  if (limite) params.set("limite", limite);

  const query = params.toString();
  return requisitarApi(`/admin/alunos${query ? `?${query}` : ""}`);
};

export const consultarAluno = (alunoId) => {
  return requisitarApi(criarUrlAluno(alunoId));
};

export const atualizarDadosAluno = (alunoId, dados) => {
  return requisitarApi(criarUrlAluno(alunoId), {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
};

export const alterarStatusAluno = (
  alunoId,
  { status, statusMatricula } = {},
) => {
  return requisitarApi(`${criarUrlAluno(alunoId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, statusMatricula }),
  });
};

export const importarAlunos = ({
  anoProcesso,
  semestreProcesso,
  mapeamentoCursos,
  candidatos,
}) => {
  return requisitarApi("/admin/alunos/importar", {
    method: "POST",
    body: JSON.stringify({
      anoProcesso,
      semestreProcesso,
      mapeamentoCursos,
      candidatos,
    }),
  });
};
