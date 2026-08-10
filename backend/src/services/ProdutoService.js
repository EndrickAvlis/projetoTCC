import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

export default class ProdutoService extends BaseService {
    constructor(){
        super(prisma.produto);
    }
}