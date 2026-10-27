import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
import AppError from "../errors/AppError.js";

const formatarNome = (texto) =>
  texto
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");

const removerDuplicadosLocais = (candidatos) => {
  const vistos = new Set();
  return candidatos.filter((c) => {
    const chave = formatarNome(c.nome).toUpperCase();
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
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
    statusAluno: status || undefined,
    cursosAluno: cursoId ? { some: { codCurso: cursoId } } : undefined,
  };

  const [total, alunos] = await Promise.all([
    prisma.aluno.count({ where }),
    prisma.aluno.findMany({
      where,
      skip,
      take,
      orderBy: { nomeAluno: "asc" },
      include: {
        cursosAluno: {
          include: { curso: true },
        },
      },
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
        include: {
          cursosAluno: {
            include: {
              curso: true,
            },
          },
        },
      },
    );
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
        .filter(
          (c) => c.cursoId && idPorNome.has(formatarNome(c.nome).toUpperCase()),
        )
        .map((c) => ({
          codCurso: c.cursoId,
          codAluno: idPorNome.get(formatarNome(c.nome).toUpperCase()),
          statusMatricula: "PENDENTE",
          periodo: c.periodo,
          classificacao: Number(c.classificacao),
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
