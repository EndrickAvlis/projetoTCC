// Serviço de fila: concentra consultas e regras específicas das senhas em espera.
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import BaseService from "./BaseService.js";

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
    return super.listar(
      {
        etapaSenha: etapa,
        statusSenha: "aguardando",
      },
      {
        select: senhaFilaSelect,
        orderBy: {
          dataHoraInicioSenha: "asc",
        },
      },
    );
  }

  async chamarSenhaSelecionada(senhaId, etapa) {
    const senha = await prisma.$transaction(async (transacao) => {
      const { count } = await transacao.senha.updateMany({
        where: {
          idSenha: senhaId,
          etapaSenha: etapa,
          statusSenha: "aguardando",
        },
        data: {
          statusSenha: "em_atendimento",
        },
      });

      if (count === 0) {
        return null;
      }

      return transacao.senha.findUnique({
        where: {
          idSenha: senhaId,
        },
        select: senhaFilaSelect,
      });
    });

    if (!senha) {
      throw new AppError(
        "Esta senha não está mais disponível para atendimento.",
        {
          status: 409,
          code: "SENHA_INDISPONIVEL",
        },
      );
    }

    return senha;
  }
}
