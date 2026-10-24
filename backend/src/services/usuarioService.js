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
      throw usuarioNaoEncontrado();
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

  async excluir(id) {
    const usuario = await super.buscarPorId(id);

    if (!usuario) {
      throw usuarioNaoEncontrado();
    }

    if (usuario.statusVoluntario) {
      throw new AppError("Apenas usuários desativados podem ser excluídos.", {
        status: 400,
        code: "USUARIO_ATIVO",
      });
    }

    return prisma.$transaction(async (tx) => {
      const compras = await tx.compra.findMany({
        where: { codVoluntario: id },
        select: { idCompra: true },
      });

      const comprasIds = compras.map((c) => c.idCompra);

      if (comprasIds.length > 0) {
        await tx.itemCompra.deleteMany({
          where: { codCompra: { in: comprasIds } },
        });
        await tx.pagamento.deleteMany({
          where: { codCompra: { in: comprasIds } },
        });
        await tx.contribuicao.deleteMany({
          where: { codCompra: { in: comprasIds } },
        });
        await tx.compra.deleteMany({
          where: { codVoluntario: id },
        });
      }

      await tx.historicoSenha.deleteMany({
        where: { codVoluntario: id },
      });

      return tx.voluntario.delete({
        where: { idVoluntario: id },
        select: usuarioSelect,
      });
    });
  }
}
