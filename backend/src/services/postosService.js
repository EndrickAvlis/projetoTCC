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
                }, { totalAguardando: 0, totalEmAtendimento: 0, totalPendente: 0 });

                const triagem = senhas.reduce((posto, senha) => {

                    if (senha.etapaSenha !== "triagem") {
                        return posto;
                    }

                    if (senha.tipoSenha) {
                        posto.totais.prioritarias += 1;
                    }

                    switch (senha.statusSenha) {
                        case "em_atendimento":
                            posto.totais.emAtendimento += 1;
                            posto.emAtendimento.push(senha);
                            break;
                        case "aguardando":
                            posto.totais.aguardando += 1;
                            posto.aguardando.push(senha);
                            break;
                        default:
                            break;
                    }

                    return posto;
                }, {
                    totais: {
                        aguardando: 0,
                        emAtendimento: 0,
                        prioritarias: 0
                    },
                    emAtendimento: [],
                    aguardando: []
                });

                const apm = senhas.reduce((posto, senha) => {

                    if (senha.etapaSenha !== "apm") {
                        return posto;
                    }

                    if (senha.tipoSenha) {
                        posto.totais.prioritarias += 1;
                    }

                    switch (senha.statusSenha) {
                        case "em_atendimento":
                            posto.totais.emAtendimento += 1;
                            posto.emAtendimento.push(senha);
                            break;
                        case "aguardando":
                            posto.totais.aguardando += 1;
                            posto.aguardando.push(senha);
                            break;
                        default:
                            break;
                    }

                    return posto;
                }, {
                    totais: {
                        aguardando: 0,
                        emAtendimento: 0,
                        prioritarias: 0
                    },
                    emAtendimento: [],
                    aguardando: []
                });

                const docs = senhas.reduce((posto, senha) => {

                    if (senha.etapaSenha !== "docs") {
                        return posto;
                    }

                    if (senha.tipoSenha) {
                        posto.totais.prioritarias += 1;
                    }

                    switch (senha.statusSenha) {
                        case "em_atendimento":
                            posto.totais.emAtendimento += 1;
                            posto.emAtendimento.push(senha);
                            break;
                        case "aguardando":
                            posto.totais.aguardando += 1;
                            posto.aguardando.push(senha);
                            break;
                        default:
                            break;
                    }

                    return posto;
                }, {
                    totais: {
                        aguardando: 0,
                        emAtendimento: 0,
                        prioritarias: 0
                    },
                    emAtendimento: [],
                    aguardando: []
                });

                const pendencias = senhas.reduce((totalPendentes, senha) => {

                    if (senha.etapaSenha !== "triagem") {
                        return totalPendentes;
                    }

                    if (senha.statusSenha !== "pendente") {
                        return totalPendentes;
                    }

                    return totalPendentes += senha;
                }, { pendencias: [] });

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
                            id: "apm",
                            nome: "APM",
                            totais: {
                                aguardando: apm.totais.aguardando,
                                emAtendimento: apm.totais.emAtendimento,
                                prioritarias: apm.totais.prioritarias
                            },
                            emAtendimento: [
                                apm.emAtendimento
                            ],
                            aguardando: [
                                apm.aguardando
                            ]
                        },
                        {
                            id: "docs",
                            nome: "Documentos",
                            totais: {
                                aguardando: docs.totais.aguardando,
                                emAtendimento: docs.totais.emAtendimento,
                                prioritarias: docs.totais.prioritarias
                            },
                            emAtendimento: [
                                docs.emAtendimento
                            ],
                            aguardando: [
                                docs.aguardando
                            ]
                        }
                    ],
                    pendencias: {
                        pendencias
                    }
                }
            });
            return resultado;
        } catch (AppError) {
            throw AppError;
        }
    }


    async listarAtendimento(tipoPeriodo = "hoje", dataInicio, dataFim, cursoId, periodoCurso) {
        try {
            const intervalo = obterIntervaloDatas(tipoPeriodo, dataInicio, dataFim);
            const resultado = await prisma.$transaction(async (tx) => {
                const senhasFinalizadas = await tx.senha.count({
                    where: {
                        statusSenha: "finalizada",
                        dataHoraInicioSenha: {
                            gte: intervalo.dataInicio
                        },
                        dataHoraFimSenha: {
                            gte: intervalo.dataFim
                        }
                    }
                });

                const senhasCanceladas = await tx.senha.count({
                    where: {
                        statusSenha: "cancelada",
                        dataHoraInicioSenha: {
                            gte: intervalo.dataInicio
                        },
                        dataHoraFimSenha: {
                            lte: intervalo.dataFim
                        }
                    }
                });

                const senhasEmitidas = await tx.senha.count({
                    where: {
                        dataHoraInicioSenha: {
                            gte: intervalo.dataInicio
                        },
                        dataHoraFimSenha: {
                            gte: intervalo.dataFim
                        }
                    }
                });

                const senhas = await tx.senha.findMany({
                    where: {
                        statusSenha: "finalizada",
                        dataHoraInicioSenha: {
                            gte: intervalo.dataInicio
                        },
                        dataHoraFimSenha: {
                            gte: intervalo.dataFim
                        }
                    }
                });

                let tma = 0;
                if (senhas.length >= 0) {
                    tma = senhas.reduce((total, senha) => {
                        const inicio = new Date(senha.dataInicioAtendimento);
                        const fim = new Date(senha.dataFinalizacao);

                        return total + (fim - inicio);
                    }, 0) / senhas.length / 1000 / 60;
                }

                const finalizadasPorHora = await obterFinalizadasPorHora(intervalo.dataInicio, intervalo.dataFim);

                const cursos = await tx.curso.findMany({
                    where: {
                        arquivado: false,
                        idCurso: cursoId
                    },
                    include: {
                        periodos: {
                            periodo: periodoCurso
                        },
                        cursosAluno: true
                    }
                });

                const cursosAtivos = cursos.reduce((ativos, curso) => {
                    let periodos = [];
                    for (const periodo of curso.periodos) {
                        periodos.push(periodo.periodo);
                    }

                    ativos.push({
                        id: curso.idCurso,
                        nome: curso.nomeCurso,
                        periodos: periodos,
                        canditadosPeriodo: curso.cursosAluno.length
                    });

                    return ativos;
                }, []);

                return {
                    cards:{
                        senhasFinalizadas: senhasFinalizadas,
                        senhasCanceladas: senhasCanceladas,
                        senhasEmitidas: senhasEmitidas,
                        tma: tma
                    },
                    finalizadasPorHora: finalizadasPorHora,
                    cursosAtivos: cursosAtivos
                }
            });
            return resultado;
        } catch (AppError) {
            throw AppError;
        }
    }
}

const obterIntervaloDatas = (tipoPeriodo, inicio, fim) => {
    const agora = new Date();

    let dataInicio;
    let dataFim;

    switch (tipoPeriodo) {
        case "hoje":
            dataInicio = new Date(agora);
            dataInicio.setHours(0, 0, 0, 0);

            dataFim = new Date(agora);
            dataFim.setHours(23, 59, 59, 999);
            break;

        case "semana":
            dataInicio = new Date(agora);
            dataInicio.setDate(agora.getDate() - ((agora.getDay() + 6) % 7));
            dataInicio.setHours(0, 0, 0, 0);

            dataFim = new Date(dataInicio);
            dataFim.setDate(dataFim.getDate() + 6);
            dataFim.setHours(23, 59, 59, 999);
            break;

        case "mes":
            dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
            dataFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999);
            break;

        case "personalizado":
            dataInicio = new Date(inicio);
            dataInicio.setHours(0, 0, 0, 0);

            dataFim = new Date(fim);
            dataFim.setHours(23, 59, 59, 999);
            break;

        default:
            throw new AppError("periodo inválido", {
                status: 409,
                code: "TIPO_PERIODO_INVALIDO"
            });
    }

    return { dataInicio, dataFim };
};


const obterFinalizadasPorHora = async (dataInicio, dataFim) => {

    // Inicializa as 12 horas, de 07h até 18h
    const resultado = Array.from({ length: 12 }, (_, i) => ({
        hora: `${String(i + 7).padStart(2, "0")}h`,
        quantidade: 0
    }));

    // Busca somente as datas de finalização
    const senhas = await prisma.senha.findMany({
        where: {
            statusSenha: "finalizada",
            dataHoraInicioSenha:{
                gte: dataInicio
            },
            dataHoraFimSenha: {
                lte: dataFim
            }
        },
        select: {
            dataHoraFimSenha: true
        }
    });

    // Contabiliza as finalizações por hora
    for (const senha of senhas) {

        const partes = new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo",
            hour: "2-digit",
            hourCycle: "h23"
        }).formatToParts(senha.dataHoraFimSenha);

        const hora = Number(
            partes.find(parte => parte.type === "hour").value
        );

        // Considera somente horários entre 07h e 18h
        if (hora >= 7 && hora <= 18) {
            resultado[hora - 7].quantidade++;
        }
    }

    return resultado;
};
