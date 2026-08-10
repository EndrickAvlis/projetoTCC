import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

export default class ContribuicaoService extends BaseService {
    constructor(){
        super(prisma.contribuicao);
    }
}