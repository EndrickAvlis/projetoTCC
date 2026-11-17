import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import BaseService from "./baseService.js";
import { cancelarSenhas } from "./senhaService.js";

export default class PostosService extends BaseService {
  async ListarFilas() {
    try {
      await cancelarSenhas();
      const resultado = await prisma.$transaction(async (tx) => {
        const senhas = await tx.senha.findMany({
          where: {
            statusSenha: {
              in: ["chamada", "em_atendimento", "aguardando", "pendente"],
            },
          },
          include: {
            aluno: {
              include: {
                cursosAluno: {
                  include: {
                    curso: true,
                  },
                },
              },
            },
            historicos: {
              orderBy: [
                {
                  dataHoraInicioHistorico: "desc",
                },
              ],
            },
          },
          orderBy: [{ tipoSenha: "desc" }, { dataHoraInicioSenha: "asc" }],
        });

        const resumo = senhas.reduce(
          (total, senha) => {
            switch (senha.statusSenha) {
              case "chamada":
              case "em_atendimento":
                total.totalEmAtendimento += 1;
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
          },
          { totalAguardando: 0, totalEmAtendimento: 0, totalPendente: 0 },
        );

        const agruparPosto = (etapa) =>
          senhas.reduce(
            (posto, senha) => {
              if (senha.etapaSenha !== etapa || senha.statusSenha === "pendente") {
                return posto;
              }

              if (senha.tipoSenha) {
                posto.totais.prioritarias += 1;
              }

              const info = {
                id: senha.idSenha,
                codigo: senha.senhaCodigo,
                prioritaria: senha.tipoSenha,
                status: senha.statusSenha,
                emitidaEm: senha.dataHoraInicioSenha,
              };

              if (senha.aluno) {
                info.aluno = {
                  id: senha.aluno.idAluno,
                  nome: senha.aluno.nomeAluno,
                };

                const matricula = senha.aluno.cursosAluno?.[0];
                if (matricula?.curso) {
                  info.curso = {
                    id: matricula.curso.idCurso,
                    nome: matricula.curso.nomeCurso,
                    periodo: matricula.periodo,
                  };
                }
              }

              if (
                senha.statusSenha === "chamada" ||
                senha.statusSenha === "em_atendimento"
              ) {
                posto.totais.emAtendimento += 1;
                info.iniciadoEm =
                  senha.historicos?.[0]?.dataHoraInicioHistorico;
                posto.emAtendimento.push(info);
              } else if (senha.statusSenha === "aguardando") {
                posto.totais.aguardando += 1;
                posto.aguardando.push(info);
              }

              return posto;
            },
            {
              totais: {
                aguardando: 0,
                emAtendimento: 0,
                prioritarias: 0,
              },
              emAtendimento: [],
              aguardando: [],
            },
          );

        const triagem = agruparPosto("triagem");
        const apm = agruparPosto("apm");
        const docs = agruparPosto("docs");

        const pendencias = senhas.reduce((totalPendentes, senha) => {
          if (senha.etapaSenha !== "triagem") {
            return totalPendentes;
          }

          if (senha.statusSenha !== "pendente") {
            return totalPendentes;
          }

          const { registradaEm = null, documentos = [] } =
            senha.documentosPendentes ?? {};
          const matricula = senha.aluno?.cursosAluno?.[0];

          const info = {
            id: senha.idSenha,
            codigo: senha.senhaCodigo,
            prioritaria: senha.tipoSenha,
            registradaEm,
            documentos,
            ...(senha.aluno && {
              aluno: {
                id: senha.aluno.idAluno,
                nome: senha.aluno.nomeAluno,
              },
            }),
            ...(matricula?.curso && {
              curso: {
                id: matricula.curso.idCurso,
                nome: matricula.curso.nomeCurso,
                periodo: matricula.periodo,
              },
            }),
          };

          totalPendentes.push(info);

          return totalPendentes;
        }, []);

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
                prioritarias: triagem.totais.prioritarias,
              },
              emAtendimento: triagem.emAtendimento,
              aguardando: triagem.aguardando,
            },
            {
              id: "apm",
              nome: "APM",
              totais: {
                aguardando: apm.totais.aguardando,
                emAtendimento: apm.totais.emAtendimento,
                prioritarias: apm.totais.prioritarias,
              },
              emAtendimento: apm.emAtendimento,
              aguardando: apm.aguardando,
            },
            {
              id: "docs",
              nome: "Documentos",
              totais: {
                aguardando: docs.totais.aguardando,
                emAtendimento: docs.totais.emAtendimento,
                prioritarias: docs.totais.prioritarias,
              },
              emAtendimento: docs.emAtendimento,
              aguardando: docs.aguardando,
            },
          ],
          pendencias: pendencias,
        };
      });
      return resultado;
    } catch (AppError) {
      throw AppError;
    }
  }

  async listarAtendimento(
    tipoPeriodo,
    dataInicio,
    dataFim,
    cursoId,
    periodoCurso,
  ) {
    try {
      await cancelarSenhas();
      const intervalo = obterIntervaloDatas(tipoPeriodo, dataInicio, dataFim);
      const resultado = await prisma.$transaction(async (tx) => {
        const senhasFinalizadas = await tx.senha.count({
          where: {
            statusSenha: "finalizada",
            dataHoraFimSenha: {
              gte: intervalo.dataInicio,
              lte: intervalo.dataFim,
            },
          },
        });

        const senhasCanceladas = await tx.senha.count({
          where: {
            statusSenha: "cancelada",
            dataHoraFimSenha: {
              gte: intervalo.dataInicio,
              lte: intervalo.dataFim,
            },
          },
        });

        const senhasEmitidas = await tx.senha.count({
          where: {
            dataHoraInicioSenha: {
              gte: intervalo.dataInicio,
              lte: intervalo.dataFim,
            },
          },
        });

        const senhas = await tx.senha.findMany({
          where: {
            statusSenha: "finalizada",
            dataHoraFimSenha: {
              gte: intervalo.dataInicio,
              lte: intervalo.dataFim,
            },
          },
          orderBy: {
            dataHoraFimSenha: "desc",
          },
        });

        let tma = 0;
        if (senhas.length > 0) {
          tma =
            senhas.reduce((total, senha) => {
              const inicio = new Date(senha.dataHoraInicioSenha);
              const fim = new Date(senha.dataHoraFimSenha);

              return total + (fim - inicio);
            }, 0) /
            senhas.length /
            1000 /
            60;

          tma = Math.trunc(tma);
        }

        const finalizadasPorHora = await obterFinalizadasPorHora(
          intervalo.dataInicio,
          intervalo.dataFim,
          tx,
        );

        const cursos = await tx.curso.findMany({
          where: {
            arquivado: false,
            idCurso: cursoId,
          },
          include: {
            periodos: {
              where: {
                periodo: periodoCurso,
              },
            },
            cursosAluno: true,
          },
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
            candidatosPeriodo: curso.cursosAluno.length,
          });

          return ativos;
        }, []);

        return {
          cards: {
            senhasFinalizadas: senhasFinalizadas,
            senhasCanceladas: senhasCanceladas,
            senhasEmitidas: senhasEmitidas,
            tma: tma,
          },
          finalizadasPorHora: finalizadasPorHora,
          cursosAtivos: cursosAtivos,
        };
      });
      return resultado;
    } catch (AppError) {
      throw AppError;
    }
  }

  async listarAuditoria(
    busca,
    status,
    tipoPeriodo,
    dataInicio,
    dataFim,
    pagina,
    limite,
  ) {
    try {
      await cancelarSenhas();
      const intervalo = obterIntervaloDatas(tipoPeriodo, dataInicio, dataFim);
      const skip = (pagina - 1) * limite;

      const buscaLimpa = (busca ?? "").trim();
      const buscaNumero = Number(buscaLimpa);
      const numeroValido =
        buscaLimpa !== "" &&
        Number.isInteger(buscaNumero) &&
        buscaNumero >= 0 &&
        buscaNumero <= 2147483647;

      const resultado = await prisma.$transaction(async (tx) => {
        const filtro = {
          statusSenha: {
            in: status ? [status] : ["finalizada", "cancelada"],
          },
          dataHoraFimSenha: {
            gte: intervalo.dataInicio,
            lte: intervalo.dataFim,
          },
          OR: [
            ...(numeroValido ? [{ senhaCodigo: { equals: buscaNumero } }] : []),
            {
              aluno: {
                nomeAluno: {
                  contains: busca,
                  mode: "insensitive",
                },
              },
            },
          ],
        };

        const senhas = await tx.senha.findMany({
          where: filtro,
          include: {
            aluno: {
              include: {
                cursosAluno: {
                  include: {
                    curso: true,
                  },
                },
              },
            },
          },
          skip: skip,
          take: limite,
          orderBy: {
            dataHoraFimSenha: "desc",
          },
        });

        const totalSenhas = await tx.senha.count({
          where: filtro,
        });

        const itens = senhas.reduce((itens, senha) => {
          const inicio = new Date(senha.dataHoraInicioSenha);
          const fim = new Date(senha.dataHoraFimSenha);

          const tempo = (fim - inicio) / 1000;

          const hora = Math.trunc(tempo / 60 / 60);
          const minutos = Math.trunc((tempo / 60) % 60);

          const tempoTotal = `${hora}h${minutos}`;

          const matricula = senha.aluno?.cursosAluno?.[0];

          const info = {
            id: senha.idSenha,
            codigo: senha.senhaCodigo,
            prioritaria: senha.tipoSenha,
            status: senha.statusSenha,
            posto: senha.etapaSenha,
            ...(senha.aluno && {
              aluno: {
                id: senha.aluno.idAluno,
                nome: senha.aluno.nomeAluno,
              },
            }),
            ...(matricula?.curso && {
              curso: {
                id: matricula.curso.idCurso,
                nome: matricula.curso.nomeCurso,
                periodo: matricula.periodo,
              },
            }),
            emitidaEm: senha.dataHoraInicioSenha,
            encerradaEm: senha.dataHoraFimSenha,
            tempoTotal: tempoTotal,
            duracaoSegundos: tempo,
            documentos: senha.documentosPendentes?.documentos ?? [],
          };

          itens.push(info);

          return itens;
        }, []);

        const totalPaginas = Math.ceil(totalSenhas / limite);

        return {
          itens: itens,
          paginacao: {
            pagina: pagina,
            limite: limite,
            totalItens: totalSenhas,
            totalPaginas: totalPaginas,
          },
        };
      });
      return resultado;
    } catch (AppError) {
      throw AppError;
    }
  }

  async trocarDePosto(idSenha, postoDestino) {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        const senha = await tx.senha.findUnique({
          where: {
            idSenha: idSenha,
          },
        });

        if (!senha) {
          throw new AppError("senha deve existir", {
            status: 404,
            code: "SENHA_NAO_ENCONTRADA",
          });
        }

        if (senha.statusSenha !== "aguardando") {
          throw new AppError("senha não está aguardando", {
            status: 409,
            code: "SENHA_NAO_AGUARDANDO",
          });
        }

        if (senha.etapaSenha === postoDestino) {
          throw new AppError(
            "posto de destino não deve ser idêntico ao posto autal",
            {
              status: 400,
              code: "POSTO_IGUAL",
            },
          );
        }

        if (postoDestino !== "triagem" && !senha.codAluno) {
          throw new AppError(
            "Não é possível transferir para este posto sem um aluno vinculado na triagem.",
            {
              status: 409,
              code: "ALUNO_NAO_VINCULADO",
            },
          );
        }

        const senhaAtualizada = await tx.senha.update({
          where: {
            idSenha: senha.idSenha,
          },
          data: {
            etapaSenha: postoDestino,
          },
        });

        return {
          senha: {
            id: senhaAtualizada.idSenha,
            codigo: senhaAtualizada.senhaCodigo,
            posto: senhaAtualizada.etapaSenha,
            status: senhaAtualizada.statusSenha,
          },
        };
      });
      return resultado;
    } catch (AppError) {
      throw AppError;
    }
  }

  async cancelarSenha(idSenha) {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        const senha = await tx.senha.findUnique({
          where: {
            idSenha: idSenha,
          },
          include: {
            historicos: true,
          },
        });

        if (!senha) {
          throw new AppError("senha deve existir", {
            status: 404,
            code: "SENHA_NAO_ENCONTRADA",
          });
        }

        if (
          senha.statusSenha === "finalizada" ||
          senha.statusSenha === "cancelada"
        ) {
          throw new AppError("senha já está encerrada", {
            status: 409,
            code: "SENHA_JA_ENCERRADA",
          });
        }

        const agora = new Date();

        await tx.historicoSenha.updateMany({
          where: {
            codSenha: idSenha,
            dataHoraFimHistorico: null,
          },
          data: {
            dataHoraFimHistorico: agora,
          },
        });

        const senhaAtualizada = await tx.senha.update({
          where: {
            idSenha: senha.idSenha,
          },
          data: {
            statusSenha: "cancelada",
            dataHoraFimSenha: agora,
          },
        });

        return {
          senha: {
            id: senhaAtualizada.idSenha,
            codigo: senhaAtualizada.senhaCodigo,
            status: senhaAtualizada.statusSenha,
            encerradaEm: senhaAtualizada.dataHoraFimSenha,
          },
        };
      });
      return resultado;
    } catch (AppError) {
      throw AppError;
    }
  }
}

const FUSO_HORARIO = "America/Sao_Paulo";

const obterDiaLocal = (data = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_HORARIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(data);

const inicioDiaLocal = (dia) => new Date(`${dia}T00:00:00.000-03:00`);
const fimDiaLocal = (dia) => new Date(`${dia}T23:59:59.999-03:00`);

const obterIntervaloDatas = (tipoPeriodo, inicio, fim) => {
  const hoje = obterDiaLocal();

  switch (tipoPeriodo) {
    case "HOJE":
      return {
        dataInicio: inicioDiaLocal(hoje),
        dataFim: fimDiaLocal(hoje),
      };

    case "SEMANA": {
      const data = new Date(`${hoje}T12:00:00Z`);
      const deslocamento = (data.getUTCDay() + 6) % 7;
      data.setUTCDate(data.getUTCDate() - deslocamento);
      const primeiroDia = data.toISOString().slice(0, 10);

      data.setUTCDate(data.getUTCDate() + 6);
      const ultimoDia = data.toISOString().slice(0, 10);

      return {
        dataInicio: inicioDiaLocal(primeiroDia),
        dataFim: fimDiaLocal(ultimoDia),
      };
    }

    case "MES": {
      const [ano, mes] = hoje.split("-").map(Number);
      const ultimoDiaMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
      const prefixoMes = hoje.slice(0, 7);

      return {
        dataInicio: inicioDiaLocal(`${prefixoMes}-01`),
        dataFim: fimDiaLocal(
          `${prefixoMes}-${String(ultimoDiaMes).padStart(2, "0")}`,
        ),
      };
    }

    case "PERSONALIZADO": {
      const diaInicio = inicio && fim ? inicio : hoje;
      const diaFim = inicio && fim ? fim : hoje;

      return {
        dataInicio: inicioDiaLocal(diaInicio),
        dataFim: fimDiaLocal(diaFim),
      };
    }

    default:
      throw new AppError("periodo inválido", {
        status: 409,
        code: "TIPO_PERIODO_INVALIDO",
      });
  }
};

const obterFinalizadasPorHora = async (dataInicio, dataFim, tx) => {
  // Inicializa as 12 horas, de 07h até 18h
  const resultado = Array.from({ length: 12 }, (_, i) => ({
    hora: `${String(i + 7).padStart(2, "0")}h`,
    quantidade: 0,
  }));

  // Busca somente as datas de finalização
  const senhas = await tx.senha.findMany({
    where: {
      statusSenha: "finalizada",
      dataHoraInicioSenha: {
        gte: dataInicio,
      },
      dataHoraFimSenha: {
        lte: dataFim,
      },
    },
    select: {
      dataHoraFimSenha: true,
    },
  });

  // Contabiliza as finalizações por hora
  for (const senha of senhas) {
    const partes = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(senha.dataHoraFimSenha);

    const hora = Number(partes.find((parte) => parte.type === "hour").value);

    // Considera somente horários entre 07h e 18h
    if (hora >= 7 && hora <= 18) {
      resultado[hora - 7].quantidade++;
    }
  }

  return resultado;
};
