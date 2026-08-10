import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

export default class ItemCompraService extends BaseService {
    constructor(){
        super(prisma.itemCompra);
    }
}