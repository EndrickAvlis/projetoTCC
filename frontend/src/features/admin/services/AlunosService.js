import { requisitarApi } from "../../../services/apiClient";

const criarUrlAluno = (alunoId) => `/alunos/${encodeURIComponent(alunoId)}`;

export const listarAlunosAdmin = ({
  busca = "",
  cidade = "",
  cursoId = "",
  status = "ATIVO",
  pagina = 1,
  limite = 10,
} = {}) => {
  const params = new URLSearchParams();

  const buscaLimpa = busca.trim();
  if (buscaLimpa) params.set("nome", buscaLimpa);
  if (cursoId) params.set("cursoId", cursoId);
  if (cidade) params.set("cidade", cidade);
  if (status) params.set("status", status);
  if (pagina) params.set("pagina", pagina);
  if (limite) params.set("limite", limite);

  const query = params.toString();
  return requisitarApi(`/alunos${query ? `?${query}` : ""}`);
};

export const listarCidadesAlunos = () => {
  return requisitarApi("/alunos/cidades");
};

export const consultarAluno = (alunoId) => {
  return requisitarApi(criarUrlAluno(alunoId));
};

export const atualizarDadosAluno = (alunoId, dados) => {
  return requisitarApi(criarUrlAluno(alunoId), {
    method: "PATCH",
    body: dados,
  });
};

export const importarAlunos = ({
  anoProcesso,
  semestreProcesso,
  candidatos,
}) => {
  return requisitarApi("/alunos/importar", {
    method: "POST",
    body: {
      anoProcesso,
      semestreProcesso,
      candidatos,
    },
  });
};
