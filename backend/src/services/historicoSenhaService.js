import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";

export default class HistoricoSenhaService extends BaseService {
    constructor(){
        super(prisma.historicoSenha, "idHistorico");
    }

    async listarAtendimentoAberto(idUsuario, etapa){
        return await prisma.historicoSenha.findFirst({
            where:{
                codVoluntario: idUsuario,
                etapaHistorico: etapa,
                dataHoraFimHistorico: null
            }
        });
    }

    async listarAtendimentoAbertoComSenha(idUsuario, idSenha, etapa){
        return await prisma.historicoSenha.findFirst({
            where:{
                codSenha: idSenha,
                codVoluntario: idUsuario,
                etapaHistorico: etapa,
                dataHoraFimHistorico: null
            }
        });
    }
}