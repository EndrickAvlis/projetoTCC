import prisma from "../config/prisma.js";
import BaseService from "./baseService.js";

export default class CursoAlunoService extends BaseService {
    constructor(){
        super(prisma.cursoAluno, "codCurso_codAluno");
    }
}