import prisma from "../config/prisma.js";

export default class BaseService {
    constructor(model){
        this.model = model;
    }

    async listar(){
        return await this.model.findMany();
    }

    async buscarPorId(id) {
        return await this.model.findUnique({
            where: { id }
        });
    }

    async criar(dados) {
        return await this.model.create({
            data: dados
        });
    }

    async atualizar(id, dados) {
        return await this.model.update({
            where: { id },
            data: dados
        });
    }

    async excluir(id) {
        return await this.model.delete({
            where: { id }
        });
    }
}