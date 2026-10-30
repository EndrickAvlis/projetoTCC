import AppError from "../errors/AppError.js";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const accessValidator = async (req, res, next) => {
  try {
    const verificado = jwt.verify(req.cookies.accessToken, ACCESS_SECRET);

    const voluntario = await prisma.voluntario.findUnique({
      where: { idVoluntario: verificado.id },
      select: { statusVoluntario: true, tipoVoluntario: true },
    });

    if (!voluntario || !voluntario.statusVoluntario) {
      return next(
        new AppError("Sua conta foi inativada pelo administrador.", {
          status: 401,
          code: "USUARIO_DESATIVADO",
        }),
      );
    }

    if (voluntario.tipoVoluntario !== verificado.tipo) {
      return next(
        new AppError(
          "Seu nível de acesso foi alterado. Faça login novamente.",
          {
            status: 401,
            code: "PERMISSAO_ALTERADA",
          },
        ),
      );
    }

    req.usuario = verificado;
    return next();
  } catch (error) {
    return next(
      new AppError("Token de acesso inválido.", {
        status: 401,
        code: "TOKEN_INVALIDO",
      }),
    );
  }
};

export const validarRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const temPermissao = rolesPermitidos.includes(req.usuario.tipo);

    if (!temPermissao) {
      throw new AppError("Acesso negado.", {
        status: 403,
        code: "ACESSO_NEGADO",
      });
    }

    next();
  };
};
