import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";
import bcrypt from "bcrypt";

export default class VoluntarioService extends BaseService {
    constructor(){
        super(prisma.voluntario, "idVoluntario");
    }

    async listar(busca){
        return await prisma.voluntario.findMany({
            select: {
                idVoluntario: true,
                nomeVoluntario: true,
                tipoVoluntario: true,
                statusVoluntario: true,
            },
            where:{
                idVoluntario: busca.id,
                nomeVoluntario:{
                    contains: busca.nome,
                    mode: "insensitive"
                },
                tipoVoluntario: busca.tipo,
                statusVoluntario: busca.status,
            }
        });
    }

    async criar(dados){
        const senhaHash = await bcrypt.hash(dados.senha, 12);
        return await prisma.voluntario.create({
            data: {
                nomeVoluntario: dados.nome,
                senhaVoluntario: senhaHash,
                tipoVoluntario: dados.tipo,
                statusVoluntario: dados.status,
            },
        })
    }
}