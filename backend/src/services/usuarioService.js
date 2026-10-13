import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
import bcrypt from "bcrypt";

const usuarioSelect = {
  idVoluntario: true,
  nomeVoluntario: true,
  tipoVoluntario: true,
  statusVoluntario: true,
};

export default class UsuarioService extends BaseService {
  constructor() {
    super(prisma.voluntario, "idVoluntario");
  }

  async listar({ id, busca = "", tipo, status } = {}) {
    const buscaLimpa = typeof busca === "string" ? busca.trim() : "";

    return super.listar(
      {
        ...(id && { idVoluntario: id }),
        ...(tipo && { tipoVoluntario: tipo }),
        ...(status !== undefined && { statusVoluntario: status }),
        ...(buscaLimpa && {
          nomeVoluntario: {
            contains: buscaLimpa,
            mode: "insensitive",
          },
        }),
      },
      {
        select: usuarioSelect,
        orderBy: {
          nomeVoluntario: "asc",
        },
      },
    );
  }

  async criar({ nome, senha, tipo, status = true }) {
    const senhaHash = await bcrypt.hash(senha, 12);

    return super.criar(
      {
        nomeVoluntario: nome,
        senhaVoluntario: senhaHash,
        tipoVoluntario: tipo,
        statusVoluntario: status,
      },
      {
        select: usuarioSelect,
      },
    );
  }

  async atualizar(id, { nome, tipo, status, senha } = {}) {
    const usuario = await super.buscarPorId(id);

    if (!usuario) {
      throw new AppError("Usuário não encontrado.", {
        status: 404,
        code: "USUARIO_NAO_ENCONTRADO",
      });
    }

    return super.atualizar(
      id,
      {
        nomeVoluntario: nome,
        tipoVoluntario: tipo,
        statusVoluntario: status,
        ...(senha && { senhaVoluntario: await bcrypt.hash(senha, 12) }),
      },
      { select: usuarioSelect },
    );
  }

}
