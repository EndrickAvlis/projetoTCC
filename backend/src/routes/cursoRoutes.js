import { Router } from "express";
import * as cursoController from "../controllers/cursoController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as cursos from "../validators/ValidatorCursos.js";

const cursoRoutes = Router();

cursoRoutes.get('/', validarRequisicao(cursos.listarCursosSchema), cursoController.listarCursosAdmin)


cursoRoutes.post('/', validarRequisicao(cursos.criarCursoSchema), cursoController.criarCursoAdmin)

cursoRoutes.patch('/:cursoId', validarRequisicao(cursos.atualizarNomeCursoSchema), cursoController.atualizarNomeCursoAdmin)
cursoRoutes.patch('/:cursoId/arquivamento', validarRequisicao(cursos.alterarArquivamentoCursoSchema), cursoController.alterarArquivamentoCurso)

cursoRoutes.post('/:cursoId/periodos', validarRequisicao(cursos.criarPeriodoCursoSchema), cursoController.criarPeriodoCursoAdmin)

cursoRoutes.patch('/:cursoId/periodos/:periodoId', validarRequisicao(cursos.atualizarPeriodoCursoSchema), cursoController.atualizarPeriodoCursoAdmin)

export default cursoRoutes;
