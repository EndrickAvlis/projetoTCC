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
                idVoluntario: busca.idVoluntario,
                nomeVoluntario:{
                    contains: busca.nomeVoluntario,
                    mode: "insensitive"
                },
                tipoVoluntario: busca.tipoVoluntario,
                statusVoluntario: busca.statusVoluntario,
            }
        });
    }

    async criar(dados){
        const senhaHash = await bcrypt.hash(dados.senhaVoluntario, 12);
        return await prisma.voluntario.create({
            data: {
                nomeVoluntario: dados.nomeVoluntario,
                senhaVoluntario: senhaHash,
                tipoVoluntario: dados.tipoVoluntario,
                statusVoluntario: dados.statusVoluntario,
            },
        })
    }
}