import prisma from "../config/prisma.js";

export default class BaseService {
    constructor(model){
        this.model = model;
    }

    async listar(){
        return await this.model.findMany();
    }
}