import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";

export default class HistoricoSenhaService extends BaseService {
    constructor(){
        super(prisma.historicoSenha);
    }
}