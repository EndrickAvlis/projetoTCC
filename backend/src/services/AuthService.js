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
                nomeVoluntario: dados.nome,
            },
        });

        if (!usuario) {
            throw new AppError("Credenciais inválidas.", {
                status: 401,
                code: "CREDENCIAIS_INVALIDAS",
            });
        }

        if(usuario.statusVoluntario !== "ativo"){
            throw new AppError("Usuario desativado.", {
                        status: 401,
                        code: "USUARIO_DESATIVADO",
                    });
        }
        
        const senhaValida = await bcrypt.compare(
            dados.senha,
            usuario.senhaVoluntario,
        );

        if (!senhaValida) {
            throw new AppError("Credenciais inválidas.", {
                status: 401,
                code: "CREDENCIAIS_INVALIDAS",
            });
        }

        if (!verificarPermissaoTela(usuario.tipoVoluntario, dados.tela)){
            throw new AppError("Acesso negado.", {
                status: 401,
                code: "CREDENCIAIS_INSUFICIENTES",
            });
        }

        const refreshPayload = {
            "id": usuario.idVoluntario,
            "tela": dados.tela,
            "guiche": dados.guiche,
        }

        const accessPayload = {
            "id": usuario.idVoluntario,
            "nome": usuario.nomeVoluntario,
            "tipo": usuario.tipoVoluntario,
            "tela": dados.tela,
            "guiche": dados.guiche
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

        if (!usuario) {
            throw new AppError("Credenciais inválidas.", {
                status: 401,
                code: "CREDENCIAIS_INVALIDAS",
            });
        }

        if (usuario.statusVoluntario !== "ativo"){
            throw new AppError("Usuario desativado.", {
                        status: 401,
                        code: "USUARIO_DESATIVADO",
                    });
        }

        const accessPayload = {
            "id": usuario.idVoluntario,
            "nome": usuario.nomeVoluntario,
            "tipo": usuario.tipoVoluntario,
            "tela": payload.tela,
            "guiche": payload.guiche
        }

        const accessToken = jwt.sign(accessPayload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
        return { accessToken };
        } catch (error) {

        }
        
    }
}

function verificarPermissaoTela(tipoUsuario, tela){
    const telasGerais = {
        admin: ["triagem", "apm", "docs", "admin", "secretaria"],
        supervisor: ["triagem", "apm", "docs", "admin", "secretaria"],
        atendente: ["triagem", "apm", "docs"]
    }

    const telasPermitidas = telasGerais[tipoUsuario];

    const temAcesso = telasPermitidas.includes(tela);

    return temAcesso;
}