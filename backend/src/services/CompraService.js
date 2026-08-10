import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

export default class compraService extends BaseService {
    constructor(){
        super(prisma.compra);
    }
}