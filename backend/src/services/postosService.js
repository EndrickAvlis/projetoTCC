import { triggerAsyncId } from "node:async_hooks";
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import BaseService from "./baseService.js";
import { stripTypeScriptTypes } from "node:module";
import { threadCpuUsage } from "node:process";

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


    async listarAtendimento(tipoPeriodo, dataInicio, dataFim, cursoId, periodoCurso) {
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
                        const inicio = new Date(senha.dataHoraInicioSenha);
                        const fim = new Date(senha.dataHoraFimSenha);

                        return total + (fim - inicio);
                    }, 0) / senhas.length / 1000 / 60;
                }

                const finalizadasPorHora = await obterFinalizadasPorHora(intervalo.dataInicio, intervalo.dataFim, tx);

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

    async listarAuditoria(busca, status, tipoPeriodo, dataInicio, dataFim, pagina, limite) {
        try{
            const intervalo = obterIntervaloDatas(tipoPeriodo, dataInicio, dataFim);
            const skip = (pagina - 1) * limite;

            const buscaNumero = Number(busca);
            const numeroValido = !Number.isNaN(buscaNumero) && busca.trim() !== "";

            const resultado = await prisma.$transaction(async (tx) => {

                const filtro = {
                        statusSenha: {
                            in: (status? [status] : ["finalizada", "cancelada"])
                        },
                        dataHoraInicioSenha: {
                            gte: intervalo.dataInicio
                        },
                        dataHoraFimSenha: {
                            lte: intervalo.dataFim
                        },
                        OR: [
                            {
                                ...(numeroValido ? [{ senhaCodigo: { equals: buscaNumero } }] : [])
                            },
                            {
                                aluno: {
                                    nomeAluno: {
                                        contains: busca,
                                        mode: "insensitive"
                                    }
                                }
                            }
                        ]
                    };

                const senhas = await tx.senha.findMany({
                    where: filtro,
                    include: {
                        aluno: {
                            include: {
                                cursosAluno: {
                                    include:{
                                        curso: true
                                    }
                                }
                            }
                        }
                    },
                    skip: skip,
                    take: limite,
                    orderBy: {
                        dataHoraFimSenha: "desc"
                    }
                });

                const totalSenhas = await tx.senha.count({
                    where: filtro
                });                

                const itens = senhas.reduce((itens, senha) => {
                    const inicio = new Date(senha.dataHoraInicioSenha);
                    const fim = new Date(senha.dataHoraFimSenha);

                    const tempo = (fim - inicio) / 1000;

                    const hora = Math.trunc(tempo / 60 / 60);
                    const minutos = Math.trunc((tempo / 60) % 60);

                    const tempoTotal = `${hora}h${minutos}`;

                    const info = {
                        id: senha.idSenha,
                        codigo: senha.senhaCodigo,
                        prioritaria: senha.tipoSenha,
                        status: senha.statusSenha,
                        posto: senha.etapaSenha,
                        aluno: {
                            id: senha.aluno.idAluno,
                            nome: senha.aluno.nomeAluno
                        },
                        curso:{
                            id: senha.aluno.cursosAluno[0].curso.idCurso,
                            nome: senha.aluno.cursosAluno[0].curso.nomeCurso,
                            periodo: senha.aluno.cursosAluno[0].periodo
                        },
                        emiditaEm: senha.dataHoraInicioSenha,
                        encerradaEm: senha.dataHoraFimSenha,
                        tempoTotal: tempoTotal,
                        duracaoSegundos: tempo,
                        documentos: senha.documentosPendentes
                    };

                    itens.push(info);

                    return itens;
                }, [])

                const totalPaginas = Math.ceil(totalSenhas / limite);

                return {
                    itens: itens,
                    paginacao: {
                        pagina: pagina,
                        limite: limite,
                        totalItens: totalSenhas,
                        totalPaginas: totalPaginas
                    }
                }
            });
            return resultado;
        }catch (AppError) {
            throw AppError
        }
    }

    async trocarDePosto(idSenha, postoDestino){
        try{
            const resultado = prisma.$transaction(async (tx) => {
                const senha = await tx.senha.findUnique({
                    where:{
                        idSenha: idSenha,
                        statusSenha: "aguardando"
                    }
                });

                if (!senha) {
                    throw new AppError("senha deve existir", {
                        status: 404,
                        code: "SENHA_NAO_ENCONTRADA"
                    });
                }

                if (senha.statusSenha !== "aguardando") {
                    throw new AppError("senha não está aguardando", {
                        status: 409,
                        code: "SENHA_NAO_AGUARDANDO"
                    });
                }

                if (senha.etapaSenha === postoDestino) {
                    throw new AppError("posto de destino não deve ser idêntico ao posto autal", {
                        status: 400,
                        code: "POSTO_IGUAL"
                    })
                }

                const senhaAtualizada = await tx.senha.update({
                    where: {
                        idSenha: senha.idSenha
                    },
                    data: {
                        etapaSenha: postoDestino
                    }
                });

                return {
                    senha: {
                        id: senhaAtualizada.idSenha,
                        codigo: senhaAtualizada.senhaCodigo,
                        posto: senhaAtualizada.etapaSenha,
                        status: senhaAtualizada.statusSenha
                    }
                }
            });
            return resultado;
        }catch (AppError) {
            throw AppError;
        }
    }

    async cancelarSenha(idSenha) {
        try{
            const resultado = prisma.$transaction(async (tx) => {
                const senha = await tx.senha.findUnique({
                    where:{
                        idSenha: idSenha
                    }
                });

                if (!senha) {
                    throw new AppError("senha deve existir", {
                        status: 404,
                        code: "SENHA_NAO_ENCONTRADA"
                    });
                }

                if (senha.statusSenha === "finalizada" || senha.statusSenha === "cancelada") {
                    throw new AppError("senha já está encerrada", {
                        status: 409,
                        code: "SENHA_JA_ENCERRADA"
                    });
                }

                const agora = new Date();

                const emAtendimento = await tx.historicoSenha.findMany({
                    where: {
                        NOT: {
                                dataHoraFimHistorico: {
                                    lte: agora
                            }
                        }
                    }
                });

                if (emAtendimento) {
                    await tx.historicoSenha.update({
                    where: {
                        codSenha: idSenha
                    },
                    data: {
                        dataHoraFimHistorico: agora
                    }
                });
                }

                const senhaAtualizada = await tx.senha.update({
                    where: {
                        idSenha: senha.idSenha
                    },
                    data: {
                        statusSenha: "cancelada",
                        dataHoraFimSenha: agora
                    }
                });

                return {
                    senha: {
                        id: senhaAtualizada.idSenha,
                        codigo: senhaAtualizada.senhaCodigo,
                        status: senhaAtualizada.statusSenha,
                        encerradaEm: senhaAtualizada.dataHoraFimSenha
                    }
                }
            });
            return resultado;
        }catch (AppError) {
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
            if (!inicio || !fim){
                dataInicio = new Date(agora);
                dataInicio.setHours(0, 0, 0, 0);

                dataFim = new Date(agora);
                dataFim.setHours(23, 59, 59, 999);
            } else {
                dataInicio = new Date(inicio);
                dataInicio.setHours(0, 0, 0, 0);

                dataFim = new Date(fim);
                dataFim.setHours(23, 59, 59, 999);
            }
            break;

        default:
            throw new AppError("periodo inválido", {
                status: 409,
                code: "TIPO_PERIODO_INVALIDO"
            });
    }

    return { dataInicio, dataFim };
};


const obterFinalizadasPorHora = async (dataInicio, dataFim, tx) => {

    // Inicializa as 12 horas, de 07h até 18h
    const resultado = Array.from({ length: 12 }, (_, i) => ({
        hora: `${String(i + 7).padStart(2, "0")}h`,
        quantidade: 0
    }));

    // Busca somente as datas de finalização
    const senhas = await tx.senha.findMany({
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
