import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";
import AppError from "../errors/AppError.js";

const formatarNome = (texto) =>
  texto
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");

export default class AlunoService extends BaseService {
  constructor() {
    super(prisma.aluno, "idAluno");
  }

  async cadastrarAluno({
    nome,
    anoProcesso,
    semestreProcesso,
    escolaridadePublica,
    cidade,
    sexo,
  }) {
    return super.criar({
      nomeAluno: formatarNome(nome),
      escolaridadePublica: Boolean(escolaridadePublica),
      cidadeAluno: cidade?.trim(),
      sexoAluno: sexo?.trim(),
      anoProcesso: anoProcesso,
      semestreProcesso: semestreProcesso,
    });
  }

  async buscarAlunos({
    nome = "",
    cidade = "",
    cursoId,
    status,
    pagina = 1,
    limite = 10,
  } = {}) {
    const where = {
      nomeAluno: nome.trim()
        ? { contains: nome.trim(), mode: "insensitive" }
        : undefined,
      cidadeAluno: cidade?.trim() || undefined,
      statusAluno: status || undefined,
      cursosAluno: cursoId ? { some: { codCurso: cursoId } } : undefined,
    };

    const skip = (pagina - 1) * limite;
    const take = limite;

    const [total, totalAtivos, alunos] = await Promise.all([
      prisma.aluno.count({ where }),
      prisma.aluno.count({ where: { statusAluno: "ATIVO" } }),
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

    return { alunos, total, totalAtivos, pagina, limite };
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

  async buscarAlunoPorId(id) {
    const aluno = await prisma.aluno.findUnique({
      where: {
        idAluno: id,
      },
      include: {
        cursosAluno: {
          include: {
            curso: true,
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

    return aluno;
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

  async vincularAlunoCurso(alunoId, cursoId) {
    const aluno = await prisma.aluno.findUnique({
      where: {
        idAluno: alunoId,
      },
    });

    if (!aluno) {
      throw new AppError("Aluno não encontrado.", {
        status: 404,
        code: "ALUNO_NAO_ENCONTRADO",
      });
    }

    const curso = await prisma.curso.findUnique({
      where: {
        idCurso: cursoId,
      },
    });

    if (!curso) {
      throw new AppError("Curso não encontrado.", {
        status: 404,
        code: "CURSO_NAO_ENCONTRADO",
      });
    }

    if (curso.arquivado) {
      throw new AppError("Não é possível vincular um curso arquivado.", {
        status: 409,
        code: "CURSO_ARQUIVADO",
      });
    }

    const vinculoExistente = await prisma.cursoAluno.findUnique({
      where: {
        codCurso_codAluno: {
          codCurso: cursoId,
          codAluno: alunoId,
        },
      },
    });

    if (vinculoExistente) {
      throw new AppError("Aluno já está vinculado a este curso.", {
        status: 409,
        code: "ALUNO_JA_VINCULADO",
      });
    }

    return prisma.cursoAluno.create({
      data: {
        codCurso: cursoId,
        codAluno: alunoId,
      },
      include: {
        curso: true,
      },
    });
  }

  async desvincularAlunoCurso(cursoId, alunoId) {
    const vinculo = await prisma.cursoAluno.findUnique({
      where: {
        codCurso_codAluno: {
          codCurso: cursoId,
          codAluno: alunoId,
        },
      },
    });

    if (!vinculo) {
      throw new AppError("Vínculo não encontrado.", {
        status: 404,
        code: "VINCULO_NAO_ENCONTRADO",
      });
    }

    return prisma.cursoAluno.delete({
      where: {
        codCurso_codAluno: {
          codCurso: cursoId,
          codAluno: alunoId,
        },
      },
    });
  }

  async importarAlunos({ anoProcesso, semestreProcesso, candidatos }) {
    return prisma.$transaction(
      async (tx) => {
        const nomes = candidatos.map((c) => c.nome.trim());

        const alunosExistentes = await tx.aluno.findMany({
          where: {
            anoProcesso,
            semestreProcesso,
            nomeAluno: { in: nomes },
          },
          select: {
            nomeAluno: true,
          },
        });

        const nomesExistentes = new Set(
          alunosExistentes.map((a) => a.nomeAluno.toUpperCase()),
        );

        const nomesProcessados = new Set();
        const candidatosValidos = [];
        let duplicados = 0;

        for (const candidato of candidatos) {
          const nomeFormatado = formatarNome(candidato.nome);
          const nomeUpper = nomeFormatado.toUpperCase();

          if (
            nomesExistentes.has(nomeUpper) ||
            nomesProcessados.has(nomeUpper)
          ) {
            duplicados++;
            continue;
          }

          nomesProcessados.add(nomeUpper);
          candidatosValidos.push({
            ...candidato,
            nome: nomeFormatado,
          });
        }

        if (candidatosValidos.length === 0) {
          return { importados: 0, duplicados };
        }

        const novosAlunos = await tx.aluno.createManyAndReturn({
          data: candidatosValidos.map((c) => ({
            nomeAluno: c.nome,
            escolaridadePublica: Boolean(c.escolaridadePublica),
            cidadeAluno: c.cidade?.trim() || null,
            sexoAluno: c.sexo?.trim() || null,
            statusAluno: "CANDIDATO",
            anoProcesso,
            semestreProcesso,
          })),
          select: {
            idAluno: true,
            nomeAluno: true,
          },
        });

        const ids = new Map(
          novosAlunos.map((a) => [a.nomeAluno.toUpperCase(), a.idAluno]),
        );

        const matriculasParaInserir = [];
        for (const c of candidatosValidos) {
          const alunoId = ids.get(c.nome.toUpperCase());
          if (alunoId && c.cursoId) {
            matriculasParaInserir.push({
              codCurso: c.cursoId,
              codAluno: alunoId,
              statusMatricula: "PENDENTE",
              periodo: c.periodo || null,
              classificacao: c.classificacao || null,
            });
          }
        }
        if (matriculasParaInserir.length > 0) {
          await tx.cursoAluno.createMany({
            data: matriculasParaInserir,
          });
        }

        return {
          importados: novosAlunos.length,
          duplicados,
        };
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );
  }
}
