// Serviço de fila: concentra consultas e regras específicas das senhas em espera.
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import BaseService from "./baseService.js";
import { cancelarSenhas } from "./senhaService.js";

const senhaFilaSelect = {
  idSenha: true,
  senhaCodigo: true,
  etapaSenha: true,
  statusSenha: true,
  tipoSenha: true,
};

export default class FilaService extends BaseService {
  constructor() {
    super(prisma.senha, "idSenha");
  }

  async listarSenhasAguardando(etapa) {
    await cancelarSenhas();
    return super.listar(
      {
        etapaSenha: etapa,
        statusSenha: "aguardando",
      },
      {
        select: senhaFilaSelect,
        orderBy: [{ tipoSenha: "desc" }, { dataHoraInicioSenha: "asc" }],
      },
    );
  }

  async chamarSenhaSelecionada(senhaId, etapa, idUsuario) {
    await cancelarSenhas();

    return prisma.$transaction(async (tx) => {
      const atendimentoAberto = await tx.historicoSenha.findFirst({
        where: {
          codVoluntario: idUsuario,
          etapaHistorico: etapa,
          dataHoraFimHistorico: null,
        },
      });

      if (atendimentoAberto) {
        throw new AppError("Você já possui um atendimento aberto nesta etapa.", {
          status: 409,
          code: "ATENDIMENTO_ABERTO",
        });
      }

      const { count } = await tx.senha.updateMany({
        where: {
          idSenha: senhaId,
          etapaSenha: etapa,
          statusSenha: "aguardando",
        },
        data: {
          statusSenha: "chamada",
        },
      });

      if (count === 0) {
        throw new AppError(
          "Esta senha não está mais disponível para atendimento.",
          {
            status: 409,
            code: "SENHA_INDISPONIVEL",
          },
        );
      }

      const senha = await tx.senha.findUnique({
        where: {
          idSenha: senhaId,
        },
        include: {
          aluno: {
            include: {
              cursosAluno: {
                include: { curso: true },
              },
            },
          },
        },
      });

      const historico = await tx.historicoSenha.create({
        data: {
          codSenha: senha.idSenha,
          codVoluntario: idUsuario,
          etapaHistorico: etapa,
        },
      });

      return { senha, historico };
    });
  }
}
