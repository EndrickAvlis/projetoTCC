import AppError from "../errors/AppError.js";

export const accessValidator = (req, res, next) => {
    try {
        const verificado = jwt.verify(req.cookies.accessToken, ACCESS_SECRET);
        return verificado;
    } catch (error) {
        throw new AppError("Token de acesso inválido.", {
            status: 401,
            code: "TOKEN_INVALIDO",
        });
    }
}

export const validarAdmin = (req, res, next) => {
    try {
        const decode = jwt.decode(req.cookies.accessToken, ACCESS_SECRET);
        if (decode.tipo !== "admin") {
            throw new AppError("Acesso negado.", {
                status: 403,
                code: "ACESSO_NEGADO",
            });
        }
        return decode;
    } catch (error) {
        throw new AppError("Token de acesso inválido.", {
            status: 401,
            code: "TOKEN_INVALIDO",
        });
    }
}

export const refreshValidator = (req, res, next) => {
    try {
        const verificado = jwt.verify(req.cookies.refreshToken, REFRESH_SECRET);
        return verificado;
    } catch (error) {
        throw new AppError("Token de atualização inválido.", {
            status: 401,
            code: "TOKEN_INVALIDO",
        });
    }
}