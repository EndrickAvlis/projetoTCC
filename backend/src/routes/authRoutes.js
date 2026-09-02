import { Router } from "express";
import * as AuthController from "../controllers/AuthController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorAuth from "../schemas/SchemaAuth.js";
import * as auth from "../middlewares/authMiddleware.js";

const authRoutes = Router();

//authRoutes.use(auth.accessValidator, auth.validarRole("admin", "supervisor"));


authRoutes.post("/login",
    validarRequisicao(ValidatorAuth.realizarLoginRequisicaoSchema),
    AuthController.login,
);

authRoutes.post("/refresh",
    validarRequisicao(ValidatorAuth.refreshTokenSchema),
    AuthController.renovarAccessToken,
);

authRoutes.post("/logout",
    AuthController.logout,
)

export default authRoutes;