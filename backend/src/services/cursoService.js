import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
import AppError from "../errors/AppError.js";

const ORDEM_PERIODOS = {
  manha: 0,
  tarde: 1,
  noite: 2,
  integral: 3,
  online: 4,
};

const ordenarPeriodos = (periodos = []) =>
  [...periodos].sort(
    (a, b) =>
      (ORDEM_PERIODOS[a.periodo] ?? 99) - (ORDEM_PERIODOS[b.periodo] ?? 99),
  );

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
  _count: {
    select: {
      cursosAluno: true,
    },
  },
  periodos: {
    select: periodoSelect,
  },
};

export default class CursoService extends BaseService {
  constructor() {
    super(prisma.curso, "idCurso");
    this.periodoCurso = prisma.periodoCurso;
  }

  async listar({ busca = "", arquivado = false } = {}) {
    const buscaLimpa = busca.trim();

    const cursos = await super.listar(
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
        orderBy: { nomeCurso: "asc" },
      },
    );

    return this.anexarVinculosPeriodos(cursos);
  }

  async criar({ nome, periodos }) {
    await this.validarNomeDisponivel(nome);

    const curso = await super.criar(
      {
        nomeCurso: nome,
        periodos: {
          create: periodos.map(({ periodo, vagasTotais, matriculaAtiva }) => ({
            periodo,
            vagasTotais,
            matriculaAtiva,
          })),
        },
      },
      { select: cursoSelect },
    );

    return {
      ...curso,
      periodos: ordenarPeriodos(curso.periodos).map((periodoCurso) => ({
        ...periodoCurso,
        possuiVinculos: false,
      })),
    };
  }

  async atualizar(cursoId, dados) {
    const cursoExistente = await super.buscarPorId(cursoId, {
      select: { idCurso: true },
    });

    if (!cursoExistente) {
      throw erroNaoEncontrado("Curso não encontrado.", "CURSO_NAO_ENCONTRADO");
    }

    if (dados.nome !== undefined) {
      await this.validarNomeDisponivel(dados.nome, cursoId);
    }

    const data = {
      ...(dados.nome !== undefined && { nomeCurso: dados.nome }),
      ...(dados.arquivado !== undefined && { arquivado: dados.arquivado }),
    };

    const cursoAtualizado = dados.arquivado
      ? await prisma.$transaction(async (transacao) => {
          await transacao.periodoCurso.updateMany({
            where: { codCurso: cursoId },
            data: { matriculaAtiva: false },
          });

          return transacao.curso.update({
            where: { idCurso: cursoId },
            data,
            select: cursoSelect,
          });
        })
      : await this.model.update({
          where: { idCurso: cursoId },
          data,
          select: cursoSelect,
        });

    const [cursoMapeado] = await this.anexarVinculosPeriodos([cursoAtualizado]);
    return cursoMapeado;
  }

  async excluir(cursoId) {
    const curso = await super.buscarPorId(cursoId, {
      select: {
        idCurso: true,
        arquivado: true,
        _count: {
          select: { cursosAluno: true },
        },
      },
    });

    if (!curso) {
      throw erroNaoEncontrado("Curso não encontrado.", "CURSO_NAO_ENCONTRADO");
    }

    if (!curso.arquivado) {
      throw erroConflito(
        "Apenas cursos arquivados podem ser excluídos.",
        "CURSO_NAO_ARQUIVADO",
      );
    }

    if (curso._count.cursosAluno > 0) {
      throw erroConflito(
        "Não é possível excluir um curso com alunos ou candidatos vinculados.",
        "CURSO_COM_VINCULOS",
      );
    }

    await prisma.$transaction(async (transacao) => {
      await transacao.periodoCurso.deleteMany({
        where: { codCurso: cursoId },
      });

      await transacao.curso.delete({
        where: { idCurso: cursoId },
      });
    });
  }

  async criarPeriodo(cursoId, { periodo, vagasTotais, matriculaAtiva }) {
    await this.obterCursoAtivo(cursoId);

    try {
      const novoPeriodo = await this.periodoCurso.create({
        data: {
          codCurso: cursoId,
          periodo,
          vagasTotais,
          matriculaAtiva,
        },
        select: periodoSelect,
      });

      return { ...novoPeriodo, possuiVinculos: false };
    } catch (error) {
      if (error.code === "P2002") {
        throw erroConflito(
          "Este período já existe para este curso.",
          "PERIODO_DUPLICADO",
        );
      }

      throw error;
    }
  }

  async atualizarPeriodo(cursoId, periodoId, dados) {
    await this.obterPeriodoDoCurso(cursoId, periodoId);

    const atualizado = await this.periodoCurso.update({
      where: { idPeriodo: periodoId },
      data: {
        ...(dados.vagasTotais !== undefined && {
          vagasTotais: dados.vagasTotais,
        }),
        ...(dados.matriculaAtiva !== undefined && {
          matriculaAtiva: dados.matriculaAtiva,
        }),
      },
      select: periodoSelect,
    });

    return {
      ...atualizado,
      possuiVinculos: await this.periodoPossuiVinculos(
        cursoId,
        atualizado.periodo,
      ),
    };
  }

  async excluirPeriodo(cursoId, periodoId) {
    const periodo = await this.obterPeriodoDoCurso(cursoId, periodoId);

    const totalPeriodos = await this.periodoCurso.count({
      where: { codCurso: cursoId },
    });

    if (totalPeriodos <= 1) {
      throw erroConflito(
        "Não é possível excluir o único período do curso.",
        "ULTIMO_PERIODO",
      );
    }

    if (await this.periodoPossuiVinculos(cursoId, periodo.periodo)) {
      throw erroConflito(
        "Não é possível excluir um período com alunos ou candidatos vinculados.",
        "PERIODO_COM_VINCULOS",
      );
    }

    await this.periodoCurso.delete({
      where: { idPeriodo: periodoId },
    });
  }

  async validarNomeDisponivel(nome, cursoIdIgnorado) {
    const existente = await this.model.findFirst({
      where: {
        nomeCurso: {
          equals: nome,
          mode: "insensitive",
        },
        ...(cursoIdIgnorado !== undefined && {
          idCurso: { not: cursoIdIgnorado },
        }),
      },
      select: { idCurso: true },
    });

    if (existente) {
      throw erroConflito(
        "Já existe um curso cadastrado com este nome.",
        "CURSO_JA_CADASTRADO",
      );
    }
  }

  async obterCursoAtivo(cursoId) {
    const curso = await super.buscarPorId(cursoId, {
      select: { idCurso: true, arquivado: true },
    });

    if (!curso) {
      throw erroNaoEncontrado("Curso não encontrado.", "CURSO_NAO_ENCONTRADO");
    }

    if (curso.arquivado) {
      throw erroConflito(
        "Não é possível gerenciar períodos de um curso arquivado.",
        "CURSO_ARQUIVADO",
      );
    }

    return curso;
  }

  async obterPeriodoDoCurso(cursoId, periodoId) {
    await this.obterCursoAtivo(cursoId);

    const periodo = await this.periodoCurso.findFirst({
      where: {
        idPeriodo: periodoId,
        codCurso: cursoId,
      },
      select: {
        idPeriodo: true,
        periodo: true,
      },
    });

    if (!periodo) {
      throw erroNaoEncontrado(
        "Período não encontrado para este curso.",
        "PERIODO_NAO_ENCONTRADO",
      );
    }

    return periodo;
  }

  async periodoPossuiVinculos(cursoId, periodo) {
    const vinculos = await prisma.cursoAluno.count({
      where: {
        codCurso: cursoId,
        periodo,
      },
    });

    return vinculos > 0;
  }

  async anexarVinculosPeriodos(cursos) {
    if (cursos.length === 0) return [];

    const idsComVinculos = cursos
      .filter((curso) => curso._count?.cursosAluno > 0)
      .map((curso) => curso.idCurso);

    const vinculosSet = new Set();

    if (idsComVinculos.length > 0) {
      const vinculos = await prisma.cursoAluno.groupBy({
        by: ["codCurso", "periodo"],
        where: {
          codCurso: { in: idsComVinculos },
          periodo: { not: null },
        },
        _count: { _all: true },
      });

      vinculos.forEach((v) => vinculosSet.add(`${v.codCurso}:${v.periodo}`));
    }

    return cursos.map((curso) => ({
      ...curso,
      periodos: ordenarPeriodos(curso.periodos).map((periodoCurso) => ({
        ...periodoCurso,
        possuiVinculos: vinculosSet.has(
          `${curso.idCurso}:${periodoCurso.periodo}`,
        ),
      })),
    }));
  }
}

const erroNaoEncontrado = (mensagem, code) =>
  new AppError(mensagem, { status: 404, code });

const erroConflito = (mensagem, code) =>
  new AppError(mensagem, { status: 409, code });
