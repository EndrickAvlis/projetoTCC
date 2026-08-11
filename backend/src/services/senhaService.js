import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import BaseService from "./BaseService.js";

const FUSO_HORARIO = "America/Sao_Paulo";

const senhaSelect = {
  idSenha: true,
  senhaCodigo: true,
  dataHoraInicioSenha: true,
  etapaSenha: true,
  statusSenha: true,
  tipoSenha: true,
};

const senhaNaoEncontrada = () =>
  new AppError("Senha não encontrada.", {
    status: 404,
    code: "SENHA_NAO_ENCONTRADA",
  });

const obterDia = (data) => {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_HORARIO,
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

const obterIntervaloDia = (agora) => {
  const dia = obterDia(agora);
  const inicioDia = new Date(`${dia}T00:00:00-03:00`);
  const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

  return { inicioDia, fimDia };
};

export default class SenhaService extends BaseService {
  constructor() {
    super(prisma.senha, "idSenha");
  }

  async criarSenha() {
    const agora = new Date();
    const { inicioDia, fimDia } = obterIntervaloDia(agora);

    const ultimaSenha = await this.model.findFirst({
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

    return super.criar(
      {
        senhaCodigo: proximoCodigo,
        dataHoraInicioSenha: agora,
        etapaSenha: "triagem",
        statusSenha: "aguardando",
        tipoSenha: false,
      },
      {
        select: senhaSelect,
      },
    );
  }

  async alterarPrioridadeSenha(id, tipoSenha) {
    const senha = await super.buscarPorId(id, {
      select: {
        statusSenha: true,
      },
    });

    if (!senha) {
      throw senhaNaoEncontrada();
    }

    if (senha.statusSenha === "finalizada") {
      throw new AppError("Não é possível alterar uma senha finalizada.", {
        status: 409,
        code: "SENHA_FINALIZADA",
      });
    }

    const senhaAtualizada = await super.atualizar(
      id,
      { tipoSenha },
      { select: senhaSelect },
    );

    if (!senhaAtualizada) {
      throw senhaNaoEncontrada();
    }

    return senhaAtualizada;
  }
}
