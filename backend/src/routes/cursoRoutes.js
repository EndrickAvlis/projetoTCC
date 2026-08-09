import { Router } from "express";
import * as cursoController from "../controllers/cursoController.js";
import * as cursoController2 from "../controllers/cursoController copy.js";

const cursoRoutes = Router();

cursoRoutes.get('/', cursoController.listarCursosAdmin)
cursoRoutes.post('/', cursoController.criarCursoAdmin)

cursoRoutes.patch('/:cursoId', cursoController.atualizarNomeCursoAdmin)
cursoRoutes.patch('/:cursoId/arquivamento', cursoController.alterarArquivamentoCurso)

cursoRoutes.post('/:cursoId/periodos', cursoController.criarPeriodoCursoAdmin)

cursoRoutes.patch('/:cursoId/periodos/:periodoId', cursoController.atualizarPeriodoCursoAdmin)

export default cursoRoutes;
