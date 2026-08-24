import { Router } from "express";
import * as AuthController from "../controllers/AuthController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorAuth from "../validators/ValidatorAuth.js";

const authRoutes = Router();

authRoutes.post("/login",
    validarRequisicao(ValidatorAuth.realizarLoginRequisicaoSchema),
    AuthController.realizarLogin,
);

export default authRoutes;