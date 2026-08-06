import prisma from "../config/prisma.js";

const ofertaSelect = {
  idOferta: true,
  periodo: true,
  vagasTotais: true,
  matriculaAtiva: true,
};

const cursoSelect = {
  idCurso: true,
  nomeCurso: true,
  arquivado: true,
  ofertas: {
    select: ofertaSelect,
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
      ...(busca
        ? {
            nomeCurso: {
              contains: busca,
              mode: "insensitive",
            },
          }
        : {}),
    },
    select: cursoSelect,
    orderBy: {
      nomeCurso: "asc",
    },
  });

export const criarCurso = async ({ nome, ofertas }) =>
  prisma.curso.create({
    data: {
      nomeCurso: nome,
      ofertas: {
        create: ofertas.map((oferta) => ({
          periodo: oferta.periodo,
          vagasTotais: oferta.vagasTotais,
          matriculaAtiva: oferta.matriculaAtiva,
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
      await transacao.ofertaCurso.updateMany({
        where: {
          idCurso: cursoId,
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

export const adicionarOfertaCurso = async (cursoId, oferta) => {
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
      "Não é possível criar ofertas em um curso arquivado.",
    );
    erro.code = "CURSO_ARQUIVADO";
    throw erro;
  }

  return prisma.ofertaCurso.create({
    data: {
      idCurso: cursoId,
      periodo: oferta.periodo,
      vagasTotais: oferta.vagasTotais,
      matriculaAtiva: oferta.matriculaAtiva,
    },
    select: ofertaSelect,
  });
};

export const atualizarOfertaCurso = async (cursoId, ofertaId, oferta) => {
  const atualizacao = await prisma.ofertaCurso.updateMany({
    where: {
      idOferta: ofertaId,
      idCurso: cursoId,
    },
    data: {
      periodo: oferta.periodo,
      vagasTotais: oferta.vagasTotais,
      matriculaAtiva: oferta.matriculaAtiva,
    },
  });
  if (atualizacao.count === 0) return null;

  return prisma.ofertaCurso.findUnique({
    where: {
      idOferta: ofertaId,
    },
    select: ofertaSelect,
  });
};

export const listarOfertasDisponiveis = async () =>
  prisma.ofertaCurso.findMany({
    where: {
      matriculaAtiva: true,
      curso: {
        arquivado: false,
      },
    },
    select: {
      idOferta: true,
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
