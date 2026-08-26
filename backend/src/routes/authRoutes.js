import { Router } from "express";
import * as AuthController from "../controllers/AuthController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorAuth from "../validators/ValidatorAuth.js";
import * as auth from "../middlewares/authValidator.js";

const authRoutes = Router();

authRoutes.use(auth.accessValidator);

authRoutes.post("/login",
    validarRequisicao(ValidatorAuth.realizarLoginRequisicaoSchema),
    AuthController.login,
);

export default authRoutes;