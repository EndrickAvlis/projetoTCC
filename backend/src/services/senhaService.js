import prisma from "../config/prisma.js";

//Define o fuso para o de São Paulo
const FusoHorario = "America/Sao_Paulo";

//Formata a data recebida para 0000-00-00
const obterDia = (data) => {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FusoHorario,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);

  const valores = Object.fromEntries(
    partes
      .filter((parte) => parte.type !== "literal")
      .map((parte) => [parte.type, parte.value]),
  );
  return `${valores.year}-${valores.month}-${valores.day}`;
};

// Recebe a data de hoje e retorna quando o dia iniciou e quando ele termina
const obterIntervaloDia = (hoje) => {
  const dia = obterDia(hoje);

  const inicioDia = new Date(`${dia}T00:00:00-03:00`);
  const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

  return { inicioDia, fimDia };
};

// Função para emitir a senha e salva-la no banco
// Ela filtra a senha para ser a proxima ou a primeira do dia
// Salva essa senha com o código correto, a hora de emissão, a primeira etapa e com o status aguardando.
export const emitirSenha = async () => {
  const agora = new Date();
  const { inicioDia, fimDia } = obterIntervaloDia(agora);

  const ultimaSenha = await prisma.senha.findFirst({
    where: {
      dataHoraInicioSenha: {
        gte: inicioDia,
        lt: fimDia,
      },
    },
    orderBy: {
      senhaCodigo: "desc",
    },
    select: {
      senhaCodigo: true,
    },
  });

  const proximoCodigo = (ultimaSenha?.senhaCodigo ?? 0) + 1;

  return prisma.senha.create({
    data: {
      senhaCodigo: proximoCodigo,
      dataHoraInicioSenha: agora,
      etapaSenha: "triagem",
      statusSenha: "aguardando",
      tipoSenha: false,
    },
    select: {
      idSenha: true,
      senhaCodigo: true,
      dataHoraInicioSenha: true,
      etapaSenha: true,
      statusSenha: true,
      tipoSenha: true,
    },
  });
};
