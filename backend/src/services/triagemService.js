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
      const atendimento = await transacao.historicoSenha.findUnique({});
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

  async iniciarAtendimento(senhaId, idUsuario) {
    return prisma.$transaction(async (transacao) => {
      const senha = await transacao.senha.findUnique({
        where: { idSenha: senhaId },
      });
      if (!senha)
        throw erro("Senha não encontrada.", 404, "SENHA_NAO_ENCONTRADA");
      if (!["aguardando", "em_atendimento"].includes(senha.statusSenha)) {
        throw erro("A senha não está disponível para atendimento.");
      }
      const outro = await transacao.historicoSenha.findFirst({
        where: {
          codVoluntario: idUsuario,
          etapaHistorico: senha.etapaSenha,
          dataHoraFimHistorico: null,
        },
      });
      if (outro && outro.codSenha !== senhaId) {
        throw erro(
          "Você já possui outro atendimento em andamento nesta etapa.",
        );
      }
      const atendimentoExistente = await buscarAtendimento(
        transacao,
        senhaId,
        idUsuario,
      );
      const atendimentoOutroUsuario = await transacao.historicoSenha.findFirst({
        where: { codSenha: senhaId, dataHoraFimHistorico: null },
      });
      if (
        atendimentoOutroUsuario &&
        atendimentoOutroUsuario.codVoluntario !== idUsuario
      ) {
        throw erro("Esta senha não está em atendimento pelo seu usuário.", 403);
      }
      let atendimento = atendimentoExistente;
      if (!atendimento) {
        if (senha.statusSenha === "aguardando") {
          const atualizado = await transacao.senha.updateMany({
            where: { idSenha: senhaId, statusSenha: "aguardando" },
            data: { statusSenha: "em_atendimento" },
          });
          if (!atualizado.count)
            throw erro("Senha indisponível para atendimento.");
        }
        atendimento = await transacao.historicoSenha.create({
          data: {
            codSenha: senhaId,
            codVoluntario: idUsuario,
            etapaHistorico: senha.etapaSenha,
            dataHoraInicioHistorico: new Date(),
          },
        });
      }
      return {
        mensagem: "Atendimento iniciado com sucesso.",
        atendimento: {
          idHistorico: atendimento.idHistorico,
          iniciadoEm: atendimento.dataHoraInicioHistorico,
        },
      };
    });
  }

  async finalizarAtendimento(senhaId, idUsuario) {
    return prisma.$transaction(async (transacao) => {
      const senha = await transacao.senha.findUnique({
        where: { idSenha: senhaId },
      });
      if (!senha)
        throw erro("Senha não encontrada.", 404, "SENHA_NAO_ENCONTRADA");
      if (senha.statusSenha !== "em_atendimento")
        throw erro("Senha não está em atendimento.");
      const atendimento = await buscarAtendimento(
        transacao,
        senhaId,
        idUsuario,
      );
      if (!atendimento || atendimento.etapaHistorico !== senha.etapaSenha) {
        throw erro("Esta senha não está em atendimento pelo seu usuário.", 403);
      }
      if (senha.etapaSenha === "triagem" && !senha.codAluno) {
        throw erro("Vincule um aluno à senha antes de finalizar a triagem.");
      }
      const proximaEtapa =
        senha.etapaSenha === "triagem"
          ? "apm"
          : senha.etapaSenha === "apm"
            ? "docs"
            : "docs";
      const agora = new Date();
      await transacao.historicoSenha.update({
        where: { idHistorico: atendimento.idHistorico },
        data: { dataHoraFimHistorico: agora },
      });
      await transacao.senha.update({
        where: { idSenha: senhaId },
        data: {
          etapaSenha: proximaEtapa,
          statusSenha:
            senha.etapaSenha === "docs" ? "finalizada" : "aguardando",
          dataHoraFimSenha: senha.etapaSenha === "docs" ? agora : null,
          ...(senha.etapaSenha === "triagem"
            ? { documentosPendentes: { documentos: [] } }
            : {}),
        },
      });
      return { mensagem: "Atendimento finalizado com sucesso.", proximaEtapa };
    });
  }

  async cancelarAtendimento(senhaId, idUsuario) {
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
      if (senha.statusSenha !== "em_atendimento" || !atendimento) {
        throw erro("Esta senha não está em atendimento pelo seu usuário.", 403);
      }
      const agora = new Date();
      await transacao.historicoSenha.update({
        where: { idHistorico: atendimento.idHistorico },
        data: { dataHoraFimHistorico: agora },
      });
      await transacao.senha.update({
        where: { idSenha: senhaId },
        data: { statusSenha: "cancelada", dataHoraFimSenha: agora },
      });
      return { mensagem: "Atendimento cancelado com sucesso." };
    });
  }

  async recuperarAtendimento(etapa, idUsuario) {
    const atendimento = await prisma.historicoSenha.findFirst({
      where: {
        codVoluntario: idUsuario,
        etapaHistorico: etapa,
        dataHoraFimHistorico: null,
        senha: { etapaSenha: etapa, statusSenha: "em_atendimento" },
      },
      include: { senha: { include: { aluno: true } } },
    });
    if (!atendimento) return { senha: null, atendimento: null };
    return {
      senha: {
        id: atendimento.senha.idSenha,
        codigo: atendimento.senha.senhaCodigo,
        prioritaria: atendimento.senha.tipoSenha,
        etapa,
        aluno: atendimento.senha.aluno
          ? {
              idAluno: atendimento.senha.aluno.idAluno,
              nome: atendimento.senha.aluno.nomeAluno,
            }
          : null,
      },
      atendimento: {
        idHistorico: atendimento.idHistorico,
        iniciadoEm: atendimento.dataHoraInicioHistorico,
      },
    };
  }
}
