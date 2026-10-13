import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";

export default class PagamentoService extends BaseService {
    constructor(){
        super(prisma.pagamento);
    }
}