import BaseService from "./BaseService.js";
import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AppError from "../errors/AppError.js";

export default class AuthClass extends BaseService {
    constructor(){
        super(prisma.voluntario, "idVoluntario");
    }


    async realizarLogin(dados){
        const usuario = await prisma.voluntario.findFirst({
            where: {
                nomeVoluntario: dados.nomeVoluntario,
            },
        });

        if (!usuario) {
            throw new AppError("Credenciais inválidas.", {
                status: 401,
                code: "CREDENCIAIS_INVALIDAS",
            });
        }
        
        const senhaValida = await bcrypt.compare(
            dados.senhaVoluntario,
            usuario.senhaVoluntario,
        );

        if (!senhaValida) {
            throw new AppError("Credenciais inválidas.", {
                status: 401,
                code: "CREDENCIAIS_INVALIDAS",
            });
        }

        const payload = {
            "id": usuario.idVoluntario,
            "nome": usuario.nomeVoluntario,
            "tipo": usuario.tipoVoluntario
        }

        const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN});

        return token;
    }
}