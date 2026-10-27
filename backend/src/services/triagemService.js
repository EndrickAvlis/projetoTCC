import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";

const erro = (mensagem, status = 409, code = "ERRO_TRIAGEM") =>
  new AppError(mensagem, { status, code });

const buscarAtendimento = (transacao, senhaId, idUsuario) =>
  transacao.historicoSenha.findFirst({
    where: {
      codSenha: senhaId,
      codVoluntario: idUsuario,
      dataHoraFimHistorico: null,
    },
  });

export default class TriagemService {
  async vincularAluno(senhaId, idUsuario, { alunoId, dadosAluno, matricula }) {
    return prisma.$transaction(async (transacao) => {
      const senha = await transacao.senha.findUnique({
        where: { idSenha: senhaId },
      });
      if (!senha)
        throw erro("Senha não encontrada.", 404, "SENHA_NAO_ENCONTRADA");

      const atendimento = await buscarAtendimento(
        transacao,
        senhaId,
        idUsuario,
      );

      if (
        senha.etapaSenha !== "triagem" ||
        senha.statusSenha !== "em_atendimento" ||
        !atendimento ||
        atendimento.etapaHistorico !== "triagem"
      ) {
        throw erro(
          "Esta senha não está em atendimento pelo seu usuário.",
          403,
          "ATENDIMENTO_NAO_AUTORIZADO",
        );
      }

      const curso = await transacao.curso.findUnique({
        where: { idCurso: matricula.cursoId },
        include: { periodos: true },
      });

      if (!curso || curso.arquivado)
        throw erro("Curso não encontrado.", 404, "CURSO_NAO_ENCONTRADO");
      if (
        !curso.periodos.some(
          (periodo) =>
            periodo.periodo === matricula.periodo && periodo.matriculaAtiva,
        )
      ) {
        throw erro(
          "Período indisponível para matrícula.",
          400,
          "PERIODO_INDISPONIVEL",
        );
      }

      const dados = {
        nomeAluno: dadosAluno.nome,
        cidadeAluno: dadosAluno.cidade ?? null,
        sexoAluno: dadosAluno.sexo ?? null,
        escolaridadePublica: dadosAluno.escolaridadePublica,
      };

      if (alunoId) {
        const existente = await transacao.aluno.findUnique({
          where: { idAluno: alunoId },
        });
        if (!existente)
          throw erro("Aluno não encontrado.", 404, "ALUNO_NAO_ENCONTRADO");
      }

      const aluno = alunoId
        ? await transacao.aluno.update({
            where: { idAluno: alunoId },
            data: dados,
          })
        : await transacao.aluno.create({ data: dados });

      await transacao.cursoAluno.upsert({
        where: {
          codCurso_codAluno: {
            codCurso: matricula.cursoId,
            codAluno: aluno.idAluno,
          },
        },
        create: {
          codCurso: matricula.cursoId,
          codAluno: aluno.idAluno,
          periodo: matricula.periodo,
          classificacao: matricula.classificacao ?? null,
          anoEscolar: matricula.ano ?? null,
        },
        update: {
          periodo: matricula.periodo,
          classificacao: matricula.classificacao ?? null,
          anoEscolar: matricula.anoEscolar ?? null,
        },
      });

      await transacao.senha.update({
        where: { idSenha: senhaId },
        data: { codAluno: aluno.idAluno },
      });
      return {
        mensagem: "Dados do aluno e matrícula vinculados à senha com sucesso.",
        alunoId: aluno.idAluno,
      };
    });
  }

  async registrarPendencias(atendimentoId, idUsuario, documentos) {
    return prisma.$transaction(async (transacao) => {
      const atendimento = await transacao.historicoSenha.findUnique({
        where: { idHistorico: atendimentoId },
      });
      if (
        !atendimento ||
        atendimento.codVoluntario !== idUsuario ||
        atendimento.etapaHistorico !== "triagem" ||
        atendimento.dataHoraFimHistorico
      ) {
        throw erro(
          "Esta senha não está em atendimento pelo seu usuário.",
          403,
          "ATENDIMENTO_NAO_AUTORIZADO",
        );
      }

      const agora = new Date();
      const resultado = await transacao.senha.updateMany({
        where: {
          idSenha: atendimento.codSenha,
          etapaSenha: "triagem",
          statusSenha: "em_atendimento",
          codAluno: { not: null },
        },
        data: {
          statusSenha: "pendente",
          documentosPendentes: {
            documentos: [...new Set(documentos)],
            registradaEm: agora.toISOString(),
          },
        },
      });
      if (!resultado.count)
        throw erro(
          "A senha deve estar em atendimento e possuir aluno vinculado.",
        );
      await transacao.historicoSenha.update({
        where: { idHistorico: atendimentoId },
        data: { dataHoraFimHistorico: agora },
      });
      return { mensagem: "Pendência documental registrada com sucesso." };
    });
  }

  async listarPendencias(etapa) {
    const senhas = await prisma.senha.findMany({
      where: { etapaSenha: etapa, statusSenha: "pendente" },
      include: {
        aluno: { include: { cursosAluno: { include: { curso: true } } } },
      },
      orderBy: { dataHoraInicioSenha: "asc" },
    });
    const pendencias = senhas.map((senha) => {
      const matricula = senha.aluno?.cursosAluno?.[0];
      return {
        senha: {
          id: senha.idSenha,
          codigo: senha.senhaCodigo,
          tipoSenha: senha.tipoSenha,
        },
        aluno: senha.aluno
          ? { id: senha.aluno.idAluno, nome: senha.aluno.nomeAluno }
          : null,
        matricula: matricula
          ? {
              curso: matricula.curso.nomeCurso,
              periodo: matricula.periodo,
              anoEscolar: matricula.anoEscolar,
            }
          : null,
        documentos: senha.documentosPendentes?.documentos ?? [],
        registradaEm: senha.documentosPendentes?.registradaEm ?? null,
      };
    });
    return { pendencias, total: pendencias.length };
  }

  async retomarAtendimento(senhaId, etapa, idUsuario) {
    return prisma.$transaction(async (transacao) => {
      const aberto = await transacao.historicoSenha.findFirst({
        where: {
          codVoluntario: idUsuario,
          etapaHistorico: etapa,
          dataHoraFimHistorico: null,
        },
      });
      if (aberto)
        throw erro(
          "Você já possui outro atendimento em andamento nesta etapa.",
        );
      const senha = await transacao.senha.findUnique({
        where: { idSenha: senhaId },
        include: { aluno: true },
      });
      if (!senha)
        throw erro("Senha não encontrada.", 404, "SENHA_NAO_ENCONTRADA");
      const resultado = await transacao.senha.updateMany({
        where: { idSenha: senhaId, etapaSenha: etapa, statusSenha: "pendente" },
        data: { statusSenha: "em_atendimento" },
      });
      if (!resultado.count)
        throw erro("Esta senha não está pendente nesta etapa.");
      const atendimento = await transacao.historicoSenha.create({
        data: {
          codSenha: senhaId,
          codVoluntario: idUsuario,
          etapaHistorico: etapa,
          dataHoraInicioHistorico: new Date(),
        },
      });
      return {
        mensagem: "Atendimento retomado com sucesso.",
        senha: {
          id: senha.idSenha,
          codigo: senha.senhaCodigo,
          tipoSenha: senha.tipoSenha,
          etapa,
          status: "em_atendimento",
        },
        atendimento: {
          idHistorico: atendimento.idHistorico,
          iniciadoEm: atendimento.dataHoraInicioHistorico,
        },
      };
    });
  }
}
