import BaseService from "./BaseService.js";
import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AppError from "../errors/AppError.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

export default class AuthClass extends BaseService {
    constructor(){
        super(prisma.voluntario, "idVoluntario");
    }


    async login(dados){
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

        const refreshPayload = {
            "id": usuario.idVoluntario
        }

        const accessPayload = {
            "id": usuario.idVoluntario,
            "nome": usuario.nomeVoluntario,
            "tipo": usuario.tipoVoluntario
        }

        const refreshToken = jwt.sign(refreshPayload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
        const accessToken = jwt.sign(accessPayload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
        return { refreshToken, accessToken };
    }

    async renovarAccessToken(refreshToken) {
        try{
            const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        if(!payload){
            throw new AppError("Token de acesso inválido.", {
                        status: 401,
                        code: "TOKEN_INVALIDO",
                    });
        }

        const usuario = await prisma.voluntario.findFirst({
            where: {
                idVoluntario: payload.id,
            },
        });

        if(!usuario || usuario.statusVoluntario !== "ativo"){
            throw new AppError("Usuario inexistente.", {
                        status: 401,
                        code: "TOKEN_INVALIDO",
                    });
        }

        const accessPayload = {
            "id": usuario.idVoluntario,
            "nome": usuario.nomeVoluntario,
            "tipo": usuario.tipoVoluntario
        }

        const accessToken = jwt.sign(accessPayload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
        return { accessToken };
        } catch (error) {

        }
        
    }
}