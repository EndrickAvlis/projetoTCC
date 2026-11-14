import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
import AppError from "../errors/AppError.js";
import { formatarNome } from "../utils/formatarNome.js";

const removerDuplicadosLocais = (candidatos) => {
  const vistos = new Set();
  return candidatos.filter((c) => {
    const chave = formatarNome(c.nome).toUpperCase();
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
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
      prisma.aluno.count({ where }),
      prisma.aluno.findMany({
        where,
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

  async listarCidades() {
    const registros = await prisma.aluno.findMany({
      where: { cidadeAluno: { not: null } },
      select: { cidadeAluno: true },
      distinct: ["cidadeAluno"],
      orderBy: { cidadeAluno: "asc" },
    });
    return registros.map((r) => r.cidadeAluno).filter(Boolean);
  }

  async atualizarAluno(id, { nome, status }) {
    const aluno = await prisma.aluno.findUnique({
      where: {
        idAluno: id,
      },
    });

    if (!aluno) {
      throw new AppError("Aluno não encontrado.", {
        status: 404,
        code: "ALUNO_NAO_ENCONTRADO",
      });
    }

    return super.atualizar(
      id,
      {
        nomeAluno: nome ? formatarNome(nome) : undefined,
        statusAluno: status,
      },
      {
        include: alunoInclude,
      },
    );
  }

  async arquivarCandidatos({ anoProcesso, semestreProcesso } = {}) {
    const { count } = await prisma.aluno.updateMany({
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
    const aluno = await prisma.aluno.findUnique({
      where: { idAluno: id },
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
    return prisma.$transaction(async (tx) => {
      const [totalArquivados, elegiveis] = await Promise.all([
        tx.aluno.count({ where: { statusAluno: "ARQUIVADO" } }),
        tx.aluno.findMany({
          where: {
            statusAluno: "ARQUIVADO",
            compras: { none: {} },
            senhas: { none: {} },
          },
          select: { idAluno: true },
        }),
      ]);

      if (elegiveis.length === 0) {
        return { excluidos: 0, mantidos: totalArquivados };
      }

      const ids = elegiveis.map((a) => a.idAluno);
      await tx.cursoAluno.deleteMany({
        where: { codAluno: { in: ids } },
      });

      const { count } = await tx.aluno.deleteMany({
        where: { idAluno: { in: ids } },
      });

      return {
        excluidos: count,
        mantidos: totalArquivados - count,
      };
    });
  }

  async importarAlunos({ anoProcesso, semestreProcesso, candidatos }) {
    return prisma.$transaction(async (tx) => {
      const candidatosUnicos = removerDuplicadosLocais(candidatos);
      const duplicadosInternos = candidatos.length - candidatosUnicos.length;

      const nomes = candidatosUnicos.map((c) => formatarNome(c.nome));
      const existentes = await tx.aluno.findMany({
        where: { anoProcesso, semestreProcesso, nomeAluno: { in: nomes } },
        select: { nomeAluno: true },
      });

      const nomesExistentesSet = new Set(
        existentes.map((a) => a.nomeAluno.toUpperCase()),
      );

      const paraInserir = candidatosUnicos.filter(
        (c) => !nomesExistentesSet.has(formatarNome(c.nome).toUpperCase()),
      );

      const totalDuplicados =
        duplicadosInternos + (candidatosUnicos.length - paraInserir.length);
      if (paraInserir.length === 0) {
        return { importados: 0, duplicados: totalDuplicados };
      }

      const novosAlunos = await tx.aluno.createManyAndReturn({
        data: paraInserir.map((c) => ({
          nomeAluno: formatarNome(c.nome),
          escolaridadePublica: Boolean(c.escolaridadePublica),
          cidadeAluno: c.cidade ? formatarNome(c.cidade) : null,
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
        .filter(
          (c) => c.cursoId && idPorNome.has(formatarNome(c.nome).toUpperCase()),
        )
        .map((c) => ({
          codCurso: c.cursoId,
          codAluno: idPorNome.get(formatarNome(c.nome).toUpperCase()),
          statusMatricula: "PENDENTE",
          periodo: c.periodo,
          classificacao:
            c.classificacao != null && c.classificacao !== "" && Number(c.classificacao) > 0 ? Number(c.classificacao) : null,
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
