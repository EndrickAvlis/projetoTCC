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

  async validarNomeDisponivel(nome, idIgnorado) {
    const existente = await prisma.voluntario.findFirst({
      where: {
        nomeVoluntario: { equals: nome, mode: "insensitive" },
        ...(idIgnorado ? { idVoluntario: { not: idIgnorado } } : {}),
      },
      select: { idVoluntario: true },
    });

    if (existente) {
      throw new AppError("Já existe um usuário cadastrado com este nome.", {
        status: 409,
        code: "USUARIO_JA_CADASTRADO",
      });
    }
  }

  async criar({ nome, senha, tipo, status = true }, autor) {
    if (autor?.tipo === "supervisor" && tipo !== "atendente") {
      throw new AppError(
        "Supervisores só podem cadastrar usuários com perfil de atendente.",
        {
          status: 403,
          code: "ACESSO_NEGADO",
        },
      );
    }

    await this.validarNomeDisponivel(nome);

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

    const ehProprioUsuario = autor?.id === id;

    if (autor?.tipo === "supervisor" && !ehProprioUsuario) {
      if (usuario.tipoVoluntario !== "atendente") {
        throw new AppError(
          "Supervisores só podem alterar contas de atendente ou a própria conta.",
          {
            status: 403,
            code: "ACESSO_NEGADO",
          },
        );
      }

      if (tipo && tipo !== "atendente") {
        throw new AppError(
          "Supervisores não têm permissão para alterar o perfil para administrador ou supervisor.",
          {
            status: 403,
            code: "ACESSO_NEGADO",
          },
        );
      }
    }

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
      usuario.statusVoluntario &&
      (status === false || (tipo && tipo !== "admin"))
    ) {
      const adminsAtivos = await prisma.voluntario.count({
        where: { tipoVoluntario: "admin", statusVoluntario: true },
      });

      if (adminsAtivos <= 1) {
        throw new AppError(
          "Não é possível alterar ou inativar o único administrador ativo do sistema.",
          {
            status: 400,
            code: "ULTIMO_ADMIN",
          },
        );
      }
    }

    if (nome !== undefined) {
      await this.validarNomeDisponivel(nome, id);
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
