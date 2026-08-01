// Serviço de Triagem: consulta cursos/alunos e salva os dados ligados à senha.
import { requisitarApi } from "./apiClient";

const normalizarMatricula = (matricula = {}) => ({
  curso:
    matricula.curso?.codigo ??
    matricula.curso?.value ??
    matricula.curso ??
    "",
  ano: String(matricula.ano ?? ""),
  periodo: matricula.periodo ?? "",
});

const normalizarAluno = (resposta) => {
  if (!resposta) return null;

  const aluno = resposta.aluno ?? resposta;
  const matriculas =
    resposta.matriculas ??
    aluno.matriculas ??
    (resposta.matricula ? [resposta.matricula] : []);

  return {
    aluno: {
      cpf: aluno.cpf ?? "",
      nome: aluno.nome ?? "",
    },
    matriculas: matriculas.map(normalizarMatricula),
  };
};

export const listarCursos = async () => {
  const resposta = await requisitarApi("/cursos");
  return resposta?.cursos ?? resposta ?? [];
};

export const buscarAlunoPorCpf = async (cpf) =>
  normalizarAluno(
    await requisitarApi(`/alunos?cpf=${encodeURIComponent(cpf)}`),
  );

export const salvarDadosDaTriagem = (senhaId, dados) =>
  requisitarApi(`/senhas/${encodeURIComponent(senhaId)}/aluno`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
