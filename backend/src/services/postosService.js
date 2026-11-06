import { triggerAsyncId } from "node:async_hooks";
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import BaseService from "./baseService.js";

export default class PostosService extends BaseService {
    async ListarFilas() {
        try {
            const resultado = await prisma.$transaction(async (tx) => {
                const senhas = await tx.senha.findMany({
                    where: {
                        statusSenha: {
                            in: ["em_atendimento", "aguardando", "pendente"]
                        }
                    }
                });

                const resumo = senhas.reduce((total, senha) => {
                    switch (senha.statusSenha) {
                        case "em_atendimento":
                            total.totalAguardando += 1;
                            break;
                        case "aguardando":
                            total.totalAguardando += 1;
                            break;
                        case "pendente":
                            total.totalPendente += 1;
                            break;
                        default:
                            break;
                    }

                    return total;
                }, { totalAguardando, totalEmAtendimento, totalPendente });

                const triagem = senhas.reduce((posto, senha) => {

                    if (senha.etapaSenha !== "triagem") {
                        return;
                    }

                    if (senha.tipoSenha) {
                        posto.totais.prioritarias += 1;
                    }

                    switch (senha.statusSenha) {
                        case "em_atendimento":
                            posto.totais.emAtendimento += 1;

                            posto.emAtendimento += senha;
                            break;
                        case "aguardando":
                            posto.totais.aguardando += 1;

                            posto.aguardando += senha;
                            break;
                        default:
                            break;
                    }

                    return posto;
                }, {
                    totais = {
                        aguardando,
                        emAtendimento,
                        prioritarias
                    },
                    emAtendimento = {},
                    aguardando = {}
                });

                const apm = senhas.reduce((posto, senha) => {

                    if (senha.etapaSenha !== "apm") {
                        return;
                    }

                    if (senha.tipoSenha) {
                        posto.totais.prioritarias += 1;
                    }

                    switch (senha.statusSenha) {
                        case "em_atendimento":
                            posto.totais.emAtendimento += 1;

                            posto.emAtendimento += senha;
                            break;
                        case "aguardando":
                            posto.totais.aguardando += 1;

                            posto.aguardando += senha;
                            break;
                        default:
                            break;
                    }

                    return posto;
                }, {
                    totais = {
                        aguardando,
                        emAtendimento,
                        prioritarias
                    },
                    emAtendimento = {},
                    aguardando = {}
                });

                const docs = senhas.reduce((posto, senha) => {

                    if (senha.etapaSenha !== "docs"){
                        return;
                    }

                    if (senha.tipoSenha){
                        posto.totais.prioritarias += 1;
                    }

                    switch(senha.statusSenha) {
                        case "em_atendimento":
                            posto.totais.emAtendimento += 1;

                            posto.emAtendimento += senha;
                        break;
                        case "aguardando":
                            posto.totais.aguardando += 1;

                            posto.aguardando += senha;
                        break;
                        default:
                        break;
                    }

                    return posto;
                }, {
                    totais = {
                            aguardando,
                            emAtendimento,
                            prioritarias
                        },
                        emAtendimento = {},
                        aguardando = {}
                    });

                const pendencias = senhas.reduce((totalPendentes, senha) => {

                    if (senha.etapaSenha !== "triagem"){
                        return;
                    }

                    if (senha.statusSenha !== "pendente"){
                        return;
                    }

                    ;

                    return totalPendentes += senha;
                }, {pendencias = {}});

                const agora = new Date();

                return {
                    atualizadoEm: agora,
                    resumo: resumo,
                    postos: [
                        {
                            id: "triagem",
                            nome: "Triagem",
                            totais: {
                                aguardando: triagem.totais.aguardando,
                                emAtendimento: triagem.totais.emAtendimento,
                                prioritarias: triagem.totais.prioritarias
                            },
                            emAtendimento: [
                                triagem.emAtendimento
                            ],
                            aguardando: [
                                triagem.aguardando
                            ]
                        },
                        {
                            id: ""
                        }
                    ] 
                }
            });
        } catch (AppError) {
            throw AppError;
        }
    }
}