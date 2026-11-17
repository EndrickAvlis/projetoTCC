import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
import AppError from "../errors/AppError.js";
import { formatarNome } from "../utils/formatarNome.js";

const normalizarAlunos = (alunos) => {
  const vistos = new Set();
  const unicos = [];

  for (const c of alunos) {
    const nome = formatarNome(c.nome);
    const chave = nome.toUpperCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);

    unicos.push({
      ...c,
      nome,
      chave,
      cidade: c.cidade ? formatarNome(c.cidade) : null,
      classificacao: c.classificacao ?? null,
    });
  }

  return unicos;
};

const alunoInclude = {
  cursosAluno: {
    include: { curso: true },
  },
  _count: {
    select: {
      compras: true,
      senhas: true,
    },
  },
};

export default class AlunoService extends BaseService {
  constructor() {
    super(prisma.aluno, "idAluno");
  }

  async listarAlunos({
    nome,
    cidade,
    cursoId,
    status,
    ignorarArquivados = false,
    pagina = 1,
    limite = 10,
  } = {}) {
    const page = Math.max(1, Number(pagina) || 1);
    const take = Math.max(1, Number(limite) || 10);
    const skip = (page - 1) * take;

    const where = {
      nomeAluno: nome?.trim()
        ? { contains: nome.trim(), mode: "insensitive" }
        : undefined,
      cidadeAluno: cidade?.trim() || undefined,
      statusAluno:
        status || (ignorarArquivados ? { not: "ARQUIVADO" } : undefined),
      cursosAluno: cursoId ? { some: { codCurso: cursoId } } : undefined,
    };

    const [total, alunos] = await Promise.all([
      this.model.count({ where }),
      super.listar(where, {
        skip,
        take,
        orderBy: { nomeAluno: "asc" },
        include: alunoInclude,
      }),
    ]);

    return {
      alunos,
      total,
      pagina: page,
      limite: take,
      totalPaginas: Math.ceil(total / take),
    };
  }

  async listarCidades({ status } = {}) {
    const registros = await super.listar(
      {
        cidadeAluno: { not: null },
        ...(status && { statusAluno: status }),
      },
      {
        select: { cidadeAluno: true },
        distinct: ["cidadeAluno"],
        orderBy: { cidadeAluno: "asc" },
      },
    );
    return registros.map((r) => r.cidadeAluno).filter(Boolean);
  }

  async atualizarAluno(id, { nome, status }) {
    const aluno = await super.buscarPorId(id, {
      select: { idAluno: true },
    });

    if (!aluno) {
      throw new AppError("Aluno não encontrado.", {
        status: 404,
        code: "ALUNO_NAO_ENCONTRADO",
      });
    }

    const data = {
      nomeAluno: nome ? formatarNome(nome) : undefined,
      statusAluno: status,
    };

    if (status === "ATIVO") {
      return prisma.$transaction(async (tx) => {
        await tx.cursoAluno.updateMany({
          where: {
            codAluno: id,
            statusMatricula: "PENDENTE",
          },
          data: { statusMatricula: "ATIVA" },
        });

        return tx.aluno.update({
          where: { idAluno: id },
          data,
          include: alunoInclude,
        });
      });
    }

    return this.model.update({
      where: { idAluno: id },
      data,
      include: alunoInclude,
    });
  }

  async arquivarAlunos({ anoProcesso, semestreProcesso } = {}) {
    const { count } = await this.model.updateMany({
      where: {
        statusAluno: "CANDIDATO",
        ...(anoProcesso != null && semestreProcesso != null
          ? { anoProcesso, semestreProcesso }
          : {}),
      },
      data: { statusAluno: "ARQUIVADO" },
    });

    return { arquivados: count };
  }

  async excluirAluno(id) {
    const aluno = await super.buscarPorId(id, {
      select: {
        idAluno: true,
        statusAluno: true,
        _count: {
          select: {
            compras: true,
            senhas: true,
          },
        },
      },
    });

    if (!aluno) {
      throw new AppError("Aluno não encontrado.", {
        status: 404,
        code: "ALUNO_NAO_ENCONTRADO",
      });
    }

    if (aluno.statusAluno !== "ARQUIVADO") {
      throw new AppError("Apenas alunos arquivados podem ser excluídos.", {
        status: 409,
        code: "ALUNO_NAO_ARQUIVADO",
      });
    }

    if (aluno._count.compras > 0 || aluno._count.senhas > 0) {
      throw new AppError(
        "Não é possível excluir um aluno com compras ou atendimentos vinculados.",
        {
          status: 409,
          code: "ALUNO_COM_VINCULOS",
        },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.cursoAluno.deleteMany({ where: { codAluno: id } });
      await tx.aluno.delete({ where: { idAluno: id } });
    });
  }

  async excluirAlunos() {
    const filtroElegiveis = {
      statusAluno: "ARQUIVADO",
      compras: { none: {} },
      senhas: { none: {} },
    };

    return prisma.$transaction(async (tx) => {
      const totalArquivados = await tx.aluno.count({
        where: { statusAluno: "ARQUIVADO" },
      });

      if (totalArquivados === 0) {
        return { excluidos: 0, mantidos: 0 };
      }

      await tx.cursoAluno.deleteMany({
        where: { aluno: filtroElegiveis },
      });

      const { count } = await tx.aluno.deleteMany({
        where: filtroElegiveis,
      });

      return {
        excluidos: count,
        mantidos: totalArquivados - count,
      };
    });
  }

  async importarAlunos({ anoProcesso, semestreProcesso, candidatos }) {
    return prisma.$transaction(async (tx) => {
      const idsCursos = [...new Set(candidatos.map((c) => c.cursoId))];
      const cursosAtivos = await tx.curso.findMany({
        where: { idCurso: { in: idsCursos }, arquivado: false },
        select: {
          idCurso: true,
          periodos: { select: { periodo: true } },
        },
      });

      if (cursosAtivos.length !== idsCursos.length) {
        throw new AppError(
          "Um ou mais cursos selecionados não existem ou estão arquivados.",
          {
            status: 409,
            code: "CURSO_INDISPONIVEL",
          },
        );
      }

      const periodosPorCurso = new Map(
        cursosAtivos.map((c) => [
          c.idCurso,
          new Set(c.periodos.map((p) => p.periodo)),
        ]),
      );

      const possuiPeriodoInexistente = candidatos.some(
        (c) => !periodosPorCurso.get(c.cursoId)?.has(c.periodo),
      );

      if (possuiPeriodoInexistente) {
        throw new AppError(
          "Um ou mais cursos selecionados não possuem o período informado no arquivo.",
          {
            status: 409,
            code: "PERIODO_CURSO_INEXISTENTE",
          },
        );
      }

      const candidatosUnicos = normalizarAlunos(candidatos);
      const duplicadosInternos = candidatos.length - candidatosUnicos.length;

      const existentes = await tx.aluno.findMany({
        where: {
          anoProcesso,
          semestreProcesso,
          nomeAluno: { in: candidatosUnicos.map((c) => c.nome) },
        },
        select: { nomeAluno: true },
      });

      const nomesExistentesSet = new Set(
        existentes.map((a) => a.nomeAluno.toUpperCase()),
      );

      const paraInserir = candidatosUnicos.filter(
        (c) => !nomesExistentesSet.has(c.chave),
      );

      const totalDuplicados =
        duplicadosInternos + (candidatosUnicos.length - paraInserir.length);
      if (paraInserir.length === 0) {
        return { importados: 0, duplicados: totalDuplicados };
      }

      const novosAlunos = await tx.aluno.createManyAndReturn({
        data: paraInserir.map((c) => ({
          nomeAluno: c.nome,
          escolaridadePublica: Boolean(c.escolaridadePublica),
          cidadeAluno: c.cidade,
          sexoAluno: c.sexo,
          statusAluno: "CANDIDATO",
          anoProcesso,
          semestreProcesso,
        })),
        select: { idAluno: true, nomeAluno: true },
      });

      const idPorNome = new Map(
        novosAlunos.map((a) => [a.nomeAluno.toUpperCase(), a.idAluno]),
      );
      const matriculas = paraInserir
        .filter((c) => c.cursoId && idPorNome.has(c.chave))
        .map((c) => ({
          codCurso: c.cursoId,
          codAluno: idPorNome.get(c.chave),
          statusMatricula: "PENDENTE",
          periodo: c.periodo,
          classificacao: c.classificacao,
        }));

      if (matriculas.length > 0) {
        await tx.cursoAluno.createMany({ data: matriculas });
      }

      return {
        importados: novosAlunos.length,
        duplicados: totalDuplicados,
      };
    });
  }
}
