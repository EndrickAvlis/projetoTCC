import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";
import AppError from "../errors/AppError.js";

export default class AlunoService extends BaseService {
  constructor() {
    super(prisma.aluno, "idAluno");
  }

  async cadastrarAluno({ cpf, ano, nome }) {
    const alunoExistente = await prisma.aluno.findFirst({
      where: {
        cpfAluno: cpf.trim(),
      },
    });

    if (alunoExistente) {
      throw new AppError("Aluno já cadastrado.", {
        status: 409,
        code: "ALUNO_JA_CADASTRADO",
      });
    }

    return super.criar({
      cpfAluno: cpf.trim(),
      anoAluno: ano,
      nomeAluno: nome.trim(),
    });
  }

  async buscarAlunos(nome = "") {
    return super.listar(
      nome.trim()
        ? {
            nomeAluno: {
              contains: nome.trim(),
              mode: "insensitive",
            },
          }
        : {},
      {
        orderBy: {
          nomeAluno: "asc",
        },
      },
    );
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

  async atualizarAluno(id, { nome }) {
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
        nomeAluno: nome.trim(),
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
}