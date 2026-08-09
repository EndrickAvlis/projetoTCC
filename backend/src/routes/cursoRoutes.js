import { Router } from "express";
import * as cursoController from "../controllers/CursoController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import {
  listarCursosSchema,
  criarCursoSchema,
  atualizarNomeCursoSchema,
  alterarArquivamentoCursoSchema,
  criarPeriodoCursoSchema,
  atualizarPeriodoCursoSchema,
} from "../validators/ValidatorCursos.js";

const cursoRoutes = Router();

cursoRoutes.get('/', validarRequisicao(listarCursosSchema), cursoController.listarCursosAdmin)
cursoRoutes.post('/', validarRequisicao(criarCursoSchema), cursoController.criarCursoAdmin)

cursoRoutes.patch('/:cursoId', validarRequisicao(atualizarNomeCursoSchema), cursoController.atualizarNomeCursoAdmin)
cursoRoutes.patch('/:cursoId/arquivamento', validarRequisicao(alterarArquivamentoCursoSchema), cursoController.alterarArquivamentoCurso)

cursoRoutes.post('/:cursoId/periodos', validarRequisicao(criarPeriodoCursoSchema), cursoController.criarPeriodoCursoAdmin)

cursoRoutes.patch('/:cursoId/periodos/:periodoId', validarRequisicao(atualizarPeriodoCursoSchema), cursoController.atualizarPeriodoCursoAdmin)

export default cursoRoutes;
