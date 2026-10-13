import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";

export default class compraService extends BaseService {
    constructor(){
        super(prisma.compra);
    }
}