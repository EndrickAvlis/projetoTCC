import prisma from "../config/prisma.js";
import BaseService from "./BaseService.js";

const periodoSelect = {
  idPeriodo: true,
  periodo: true,
  vagasTotais: true,
  matriculaAtiva: true,
};

const cursoSelect = {
  idCurso: true,
  nomeCurso: true,
  arquivado: true,
  periodos: {
    select: periodoSelect,
    orderBy: {
      periodo: "asc",
    },
  },
};

export default class CursoService extends BaseService {
  constructor() {
    super(prisma.curso);
  }

  async listar(busca = "", filtro = "false") {
    const arquivado = filtro === "true";

    const listaCursos = await prisma.curso.findMany({
      where: {
        arquivado,
        nomeCurso: {
          contains: busca,
          mode: "insensitive",
        }
      },
      select: cursoSelect,
      orderBy: {
        nomeCurso: "asc"
      }
    });

    return listaCursos;
  }

    async criar({nome, periodos}){
      prisma.curso.create({
        data: {
          nomeCurso: nome,
          periodos: {
            create: periodos.map((periodo) => ({
              periodo: periodo.periodo,
              vagasTotais: periodo.vagasTotais,
              matriculaAtiva: periodo.matriculaAtiva,
            })),
          },
        },
        select: cursoSelect
      })
    }
}