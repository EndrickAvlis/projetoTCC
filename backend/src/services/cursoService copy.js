import { PeriodoCurso } from "@prisma/client";
import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

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

export default class CursoService extends BaseService {
  constructor() {
    super(prisma.curso, "idCurso");
    this.periodoCurso = prisma.periodoCurso;
  }

  async listarCursos({ busca = "", filtro = "false" } = {}) {
    const arquivado = filtro === "true";
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
            totalVagas: periodoCurso.totalVagas,
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
    return super.atualizar(
      cursoId,
      {
        nomeCurso: nome,
      },
      {
        select: cursoSelect,
      },
    );
  }

  async arquivarCurso(cursoId, arquivado) {
    return prisma.$transaction(async (transacao) => {
      const { count } = await prisma.transacao.curso.updateMany({
        where: {
          idCurso: cursoId,
        },
        data: {
          arquivado,
        },
      });
    });

    if (count === 0) {
      return null;
    }

    if (arquivado) {
      await prisma.transacao.periodoCurso.updateMany({
        where: {
          codCurso: cursoId,
        },
        data: {
          matriculaAtiva: false,
        },
      });

      return transacao.curso.findUnique({
        where: {
          idCurso: cursoId,
        },
        select: cursoSelect,
      });
    }
  }

  async adicionarPeriodoCurso(cursoId, periodoCurso) {
    const curso = await super.buscarPorId(cursoId, {
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

    return this.periodoModel.create({
      data: {
        codCurso: cursoId,
        periodo: periodoCurso.periodo,
        vagasTotais: periodoCurso.vagasTotais,
        matriculaAtiva: periodoCurso.matriculaAtiva,
      },
      select: periodoSelect,
    });
  }
}
