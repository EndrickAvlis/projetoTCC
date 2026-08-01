// Consulta as senhas aguardando de uma etapa do atendimento.
import prisma from "../config/prisma.js";

//*Vamos selecionar todas as senhas do banco na qual a etapa é a enviada com o status aguardando
export const listarSenhasAguardando = async (etapa) =>
  prisma.senha.findMany({
    where: {
      etapaSenha: etapa,
      statusSenha: "aguardando",
    },
    select: {
      idSenha: true,
      senhaCodigo: true,
      etapaSenha: true,
      statusSenha: true,
      tipoSenha: true,
    },
    orderBy: {
      dataHoraInicioSenha: "asc",
    },
  });

// Reserva a senha escolhida apenas se ela ainda estiver aguardando na etapa informada.
export const chamarSenhaSelecionada = async (senhaId, etapa) => {
  const atualizacao = await prisma.senha.updateMany({
    where: {
      idSenha: senhaId,
      etapaSenha: etapa,
      statusSenha: "aguardando",
    },
    data: {
      statusSenha: "em_atendimento",
    },
  });

  if (atualizacao.count === 0) {
    return null;
  }

  return prisma.senha.findUnique({
    where: {
      idSenha: senhaId,
    },
    select: {
      idSenha: true,
      senhaCodigo: true,
      etapaSenha: true,
      statusSenha: true,
      tipoSenha: true,
    },
  });
};
