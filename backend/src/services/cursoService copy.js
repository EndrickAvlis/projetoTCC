import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

export default class CursoService extends BaseService {
  constructor(){
    super(prisma.curso);
  }

  async listar(busca = "", filtro = "true"){
    const arquivado = filtro === "true";

    const listaCursos = await prisma.curso.findMany({
      where: {
        arquivado,
        nomeCurso: {
        contains: busca,
        mode: "insensitive",
        }
      },
      orderBy: {
        nomeCurso: "asc"
        }
    });

    return listaCursos;
  }
}