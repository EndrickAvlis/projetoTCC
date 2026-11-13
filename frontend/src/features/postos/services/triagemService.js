import { requisitarApi } from "../../../services/apiClient";

export const listarAlunos = (nome, limite = 10) => {
  const query = new URLSearchParams({ nome, limite: String(limite) });
  return requisitarApi(`/alunos?${query.toString()}`);
};

export const vincularAluno = (senhaId, dados, alunoId) => {
  const payload = {
    alunoId: alunoId ? Number(alunoId) : null,
    dadosAluno: {
      nome: dados.nome.trim(),
      cidade: dados.cidade.trim(),
      sexo: dados.sexo,
      escolaridadePublica: dados.escolaridadePublica === "true",
    },
    matricula: {
      cursoId: Number(dados.curso),
      classificacao: Number(dados.classificacao),
      periodo: dados.periodo,
      anoEscolar: Number(dados.ano),
    },
  };

  return requisitarApi(`/triagem/${encodeURIComponent(senhaId)}/aluno`, {
    method: "PUT",
    body: payload,
  });
};

export const listarCursos = () => requisitarApi("/cursos");

export const listarPendencias = () =>
  requisitarApi("/triagem/pendencias?etapa=triagem");

export const registrarPendencia = (atendimentoId, documentos) =>
  requisitarApi("/triagem/pendencias", {
    method: "POST",
    body: { atendimentoId, documentos },
  });

export const retomarAtendimento = (senhaId, etapa = "triagem") =>
  requisitarApi("/triagem/pendencias/retomar", {
    method: "POST",
    body: { senhaId, etapa },
  });
