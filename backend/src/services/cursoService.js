import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";
import AppError from "../errors/AppError.js";

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
      vagasTotais: "desc",
    },
  },
};

const cursoNaoEncontrado = () =>
  new AppError("Curso não encontrado.", {
    status: 404,
    code: "CURSO_NAO_ENCONTRADO",
  });

const periodoNaoEncontrado = () =>
  new AppError("Período não encontrado para este curso.", {
    status: 404,
    code: "PERIODO_NAO_ENCONTRADO",
  });

export default class CursoService extends BaseService {
  constructor() {
    super(prisma.curso, "idCurso");
    this.periodoCurso = prisma.periodoCurso;
  }

  async listarCursos({ busca = "", arquivado = false } = {}) {
    const buscaLimpa = busca.trim();

    return super.listar(
      {
        arquivado,
        ...(buscaLimpa && {
          nomeCurso: {
            contains: buscaLimpa,
            mode: "insensitive",
          },
        }),
      },
      {
        select: cursoSelect,
        orderBy: {
          nomeCurso: "asc",
        },
      },
    );
  }

  async criarCurso({ nome, periodos }) {
    return super.criar(
      {
        nomeCurso: nome,
        periodos: {
          create: periodos.map((periodoCurso) => ({
            periodo: periodoCurso.periodo,
            vagasTotais: periodoCurso.vagasTotais,
            matriculaAtiva: periodoCurso.matriculaAtiva,
          })),
        },
      },
      {
        select: cursoSelect,
      },
    );
  }

  async atualizarNomeCurso(cursoId, nome) {
    const curso = await super.atualizar(
      cursoId,
      { nomeCurso: nome },
      { select: cursoSelect },
    );

    if (!curso) {
      throw cursoNaoEncontrado();
    }

    return curso;
  }

  async arquivarCurso(cursoId, arquivado) {
    const curso = await prisma.$transaction(async (transacao) => {
      const { count } = await transacao.curso.updateMany({
        where: {
          idCurso: cursoId,
        },
        data: {
          arquivado,
        },
      });

      if (count === 0) {
        return null;
      }

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

    if (!curso) {
      throw cursoNaoEncontrado();
    }

    return curso;
  }

  async adicionarPeriodoCurso(cursoId, periodoCurso) {
    const curso = await super.buscarPorId(cursoId, {
      select: {
        arquivado: true,
      },
    });

    if (!curso) {
      throw new AppError("Curso não encontrado.", {
        status: 404,
        code: "CURSO_NAO_ENCONTRADO",
      });
    }

    if (curso.arquivado) {
      throw new AppError(
        "Não é possível criar períodos em um curso arquivado.",
        {
          status: 409,
          code: "CURSO_ARQUIVADO",
        },
      );
    }

    try {
      return await this.periodoCurso.create({
        data: {
          codCurso: cursoId,
          periodo: periodoCurso.periodo,
          vagasTotais: periodoCurso.vagasTotais,
          matriculaAtiva: periodoCurso.matriculaAtiva,
        },
        select: periodoSelect,
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new AppError("Este período já existe para este curso.", {
          status: 409,
          code: "PERIODO_DUPLICADO",
        });
      }

      throw error;
    }
  }

  async atualizarPeriodoCurso(cursoId, periodoId, periodoCurso) {
    const { count } = await this.periodoCurso.updateMany({
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

    if (count === 0) {
      throw periodoNaoEncontrado();
    }

    return this.periodoCurso.findUnique({
      where: {
        idPeriodo: periodoId,
      },
      select: periodoSelect,
    });
  }
}
