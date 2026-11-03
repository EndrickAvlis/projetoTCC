import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";
import bcrypt from "bcrypt";
import AppError from "../errors/AppError.js";

const usuarioSelect = {
  idVoluntario: true,
  nomeVoluntario: true,
  tipoVoluntario: true,
  statusVoluntario: true,
};

const usuarioNaoEncontrado = () =>
  new AppError("Usuário não encontrado.", {
    status: 404,
    code: "USUARIO_NAO_ENCONTRADO",
  });

export default class UsuarioService extends BaseService {
  constructor() {
    super(prisma.voluntario, "idVoluntario");
  }

  async listar({ id, busca, tipo, status } = {}) {
    return super.listar(
      {
        idVoluntario: id,
        tipoVoluntario: tipo,
        statusVoluntario: status,
        nomeVoluntario: busca
          ? { contains: busca, mode: "insensitive" }
          : undefined,
      },
      {
        select: usuarioSelect,
        orderBy: { nomeVoluntario: "asc" },
      },
    );
  }

  async criar({ nome, senha, tipo, status = true }, autor) {
    if (autor?.tipo === "supervisor" && tipo === "admin") {
      throw new AppError("Supervisores não podem cadastrar usuários administradores.", {
        status: 403,
        code: "ACESSO_NEGADO",
      });
    }

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

  async atualizar(id, { nome, tipo, status, senha } = {}, autor) {
    const usuario = await super.buscarPorId(id);

    if (!usuario) {
      throw usuarioNaoEncontrado();
    }

    if (autor?.tipo === "supervisor") {
      if (usuario.tipoVoluntario === "admin") {
        throw new AppError("Supervisores não têm permissão para alterar contas de administrador.", {
          status: 403,
          code: "ACESSO_NEGADO",
        });
      }

      if (tipo === "admin") {
        throw new AppError("Supervisores não têm permissão para promover usuários a administrador.", {
          status: 403,
          code: "ACESSO_NEGADO",
        });
      }
    }

    const ehProprioUsuario = autor?.id === id;

    if (ehProprioUsuario) {
      if (status === false) {
        throw new AppError("Você não pode inativar seu próprio usuário.", {
          status: 400,
          code: "AUTO_DESATIVACAO_PROIBIDA",
        });
      }

      if (tipo && tipo !== usuario.tipoVoluntario) {
        throw new AppError("Você não pode alterar seu próprio nível de acesso.", {
          status: 400,
          code: "AUTO_REBAIXAMENTO_PROIBIDO",
        });
      }
    }

    if (
      usuario.tipoVoluntario === "admin" &&
      (status === false || (tipo && tipo !== "admin"))
    ) {
      const adminsAtivos = await prisma.voluntario.count({
        where: { tipoVoluntario: "admin", statusVoluntario: true },
      });

      if (adminsAtivos <= 1) {
        throw new AppError("Não é possível alterar ou inativar o único administrador ativo do sistema.", {
          status: 400,
          code: "ULTIMO_ADMIN",
        });
      }
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
