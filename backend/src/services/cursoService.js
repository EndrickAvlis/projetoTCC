import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
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

const periodoDuplicado = () =>
  new AppError("Este período já existe para este curso.", {
    status: 409,
    code: "PERIODO_DUPLICADO",
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

  async atualizarCurso(cursoId, dados) {
    const cursoExistente = await super.buscarPorId(cursoId, {
      select: { idCurso: true },
    });

    if (!cursoExistente) {
      throw cursoNaoEncontrado();
    }

    const data = {
      nomeCurso: dados.nome,
      arquivado: dados.arquivado,
    };

    if (dados.arquivado) {
      return prisma.$transaction(async (transacao) => {
        await transacao.curso.update({
          where: { idCurso: cursoId },
          data,
        });

        await transacao.periodoCurso.updateMany({
          where: { codCurso: cursoId },
          data: { matriculaAtiva: false },
        });

        return transacao.curso.findUnique({
          where: { idCurso: cursoId },
          select: cursoSelect,
        });
      });
    }

    return super.atualizar(cursoId, data, {
      select: cursoSelect,
    });
  }

  async criarPeriodo(cursoId, periodoCurso) {
    await this.obterCursoAtivo(cursoId);

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
        throw periodoDuplicado();
      }

      throw error;
    }
  }

  async atualizarPeriodo(cursoId, periodoId, periodoCurso) {
    await this.obterCursoAtivo(cursoId);

    try {
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
        throw new AppError("Período não encontrado para este curso.", {
          status: 404,
          code: "PERIODO_NAO_ENCONTRADO",
        });
      }

      return this.periodoCurso.findUnique({
        where: {
          idPeriodo: periodoId,
        },
        select: periodoSelect,
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw periodoDuplicado();
      }

      throw error;
    }
  }

  async excluir(cursoId) {
    const curso = await super.buscarPorId(cursoId, {
      select: {
        idCurso: true,
        arquivado: true,
      },
    });

    if (!curso) {
      throw cursoNaoEncontrado();
    }

    if (!curso.arquivado) {
      throw new AppError("Apenas cursos arquivados podem ser excluídos.", {
        status: 400,
        code: "CURSO_ATIVO",
      });
    }

    return prisma.$transaction(async (tx) => {
      await tx.cursoAluno.deleteMany({
        where: { codCurso: cursoId },
      });

      await tx.periodoCurso.deleteMany({
        where: { codCurso: cursoId },
      });

      return tx.curso.delete({
        where: { idCurso: cursoId },
        select: cursoSelect,
      });
    });
  }

  async obterCursoAtivo(cursoId) {
    const curso = await super.buscarPorId(cursoId, {
      select: {
        arquivado: true,
      },
    });

    if (!curso) {
      throw cursoNaoEncontrado();
    }

    if (curso.arquivado) {
      throw new AppError(
        "Não é possível gerenciar períodos de um curso arquivado.",
        {
          status: 409,
          code: "CURSO_ARQUIVADO",
        },
      );
    }

    return curso;
  }
}
