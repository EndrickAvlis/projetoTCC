import prisma from "../config/prisma.js";

const periodoSelect = {
  idPeriodo: true,
  periodo: true,
  vagasTotais: true,
  matriculaAtiva: true,
};

const cursoSelect = {
  idCurso: true,
  nomeCurso: true,
  arquivado: true,
  periodos: {
    select: periodoSelect,
    orderBy: {
      periodo: "asc",
    },
  },
};

export const pesquisarCursosAdmin = async ({
  busca = "",
  arquivado = false,
} = {}) =>
  prisma.curso.findMany({
    where: {
      arquivado,
      ...(busca? {
            nomeCurso: {
              contains: busca,
              mode: "insensitive",
            },
          } : {}),
    },
    select: cursoSelect,
    orderBy: {
      nomeCurso: "asc",
    },
  });

export const criarCurso = async ({ nome, periodos }) =>
  prisma.curso.create({
    data: {
      nomeCurso: nome,
      periodos: {
        create: periodos.map((periodoCurso) => ({
          periodo: periodoCurso.periodo,
          vagasTotais: periodoCurso.vagasTotais,
          matriculaAtiva: periodoCurso.matriculaAtiva,
        })),
      },
    },
    select: cursoSelect,
  });

export const atualizarNomeCurso = async (cursoId, nome) => {
  const atualizacao = await prisma.curso.updateMany({
    where: {
      idCurso: cursoId,
    },
    data: {
      nomeCurso: nome,
    },
  });
  if (atualizacao.count === 0) return null;

  return prisma.curso.findUnique({
    where: {
      idCurso: cursoId,
    },
    select: cursoSelect,
  });
};

export const arquivarCurso = async (cursoId, arquivado) =>
  prisma.$transaction(async (transacao) => {
    const atualizacao = await transacao.curso.updateMany({
      where: {
        idCurso: cursoId,
      },
      data: {
        arquivado,
      },
    });
    if (atualizacao.count === 0) return null;

    if (arquivado) {
      await transacao.periodoCurso.updateMany({
        where: {
          codCurso: cursoId,
        },
        data: {
          matriculaAtiva: false,
        },
      });
    }

    return transacao.curso.findUnique({
      where: {
        idCurso: cursoId,
      },
      select: cursoSelect,
    });
  });

export const adicionarPeriodoCurso = async (cursoId, periodoCurso) => {
  const curso = await prisma.curso.findUnique({
    where: {
      idCurso: cursoId,
    },
    select: {
      arquivado: true,
    },
  });

  if (!curso) {
    const erro = new Error("Curso não encontrado.");
    erro.code = "CURSO_NAO_ENCONTRADO";
    throw erro;
  }

  if (curso.arquivado) {
    const erro = new Error(
      "Não é possível criar períodos em um curso arquivado.",
    );
    erro.code = "CURSO_ARQUIVADO";
    throw erro;
  }

  return prisma.periodoCurso.create({
    data: {
      codCurso: cursoId,
      periodo: periodoCurso.periodo,
      vagasTotais: periodoCurso.vagasTotais,
      matriculaAtiva: periodoCurso.matriculaAtiva,
    },
    select: periodoSelect,
  });
};

export const atualizarPeriodoCurso = async (cursoId, periodoId, periodoCurso) => {
  const atualizacao = await prisma.periodoCurso.updateMany({
    where: {
      idPeriodo: periodoId,
      codCurso: cursoId,
    },
    data: {
      periodo: periodoCurso.periodo,
      vagasTotais: periodoCurso.vagasTotais,
      matriculaAtiva: periodoCurso.matriculaAtiva,
    },
  });
  if (atualizacao.count === 0) return null;

  return prisma.periodoCurso.findUnique({
    where: {
      idPeriodo: periodoId,
    },
    select: periodoSelect,
  });
};

export const listarPeriodosDisponiveis = async () =>
  prisma.periodoCurso.findMany({
    where: {
      matriculaAtiva: true,
      curso: {
        arquivado: false,
      },
    },
    select: {
      idPeriodo: true,
      periodo: true,
      vagasTotais: true,
      curso: {
        select: {
          idCurso: true,
          nomeCurso: true,
        },
      },
    },
    orderBy: {
      curso: {
        nomeCurso: "asc",
      },
    },
  });
