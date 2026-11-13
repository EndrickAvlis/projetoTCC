import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
import { obterIntervaloDia } from "./senhaService.js";

export default class HistoricoSenhaService extends BaseService {
  constructor() {
    super(prisma.historicoSenha, "idHistorico");
  }

  async listarAtendimentoAberto(idUsuario, etapa) {
    return await prisma.historicoSenha.findFirst({
      where: {
        codVoluntario: idUsuario,
        etapaHistorico: etapa,
        dataHoraFimHistorico: null,
      },
    });
  }

  async listarAtendimentoAbertoComSenha(idUsuario, idSenha, etapa) {
    return await prisma.historicoSenha.findFirst({
      where: {
        codSenha: idSenha,
        codVoluntario: idUsuario,
        etapaHistorico: etapa,
        dataHoraFimHistorico: null,
      },
    });
  }

  async listarChamadaHoje(etapa) {
    const { inicioDia, fimDia } = obterIntervaloDia();

    const historicos = await prisma.historicoSenha.findMany({
      where: {
        etapaHistorico: etapa,
        senha: {
          dataHoraInicioSenha: {
            gte: inicioDia,
            lt: fimDia,
          },
        },
      },
      include: {
        senha: true,
      },
      orderBy: {
        idHistorico: "desc",
      },
    });

    return Array.from(
      new Map(historicos.map((h) => [h.senha.idSenha, h.senha])).values(),
    );
  }
}
