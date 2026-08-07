import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

export default class HistoricoSenhaService extends BaseService {
    constructor(){
        super(prisma.historicoSenha);
    }
}