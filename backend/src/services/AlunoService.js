import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

export default class AlunoService extends BaseService {
    constructor(){
        super(prisma.aluno);
    }
}