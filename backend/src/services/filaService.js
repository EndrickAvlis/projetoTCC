// Consulta as senhas aguardando de uma etapa do atendimento.
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";

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
    throw new AppError(
      "Esta senha não está mais disponível para atendimento.",
      {
        status: 409,
        code: "SENHA_INDISPONIVEL",
      },
    );
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
