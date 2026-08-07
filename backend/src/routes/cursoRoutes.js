import { Router } from "express";
import * as cursoController from "../controllers/cursoController.js";
import * as cursoController2 from "../controllers/cursoController copy.js";

const cursoRoutes = Router();

cursoRoutes.get('/', cursoController2.listarCursosAdmin)
cursoRoutes.post('/', cursoController.criarCursoAdmin)

cursoRoutes.patch('/:cursoId', cursoController.atualizarNomeCursoAdmin)
cursoRoutes.patch('/:cursoId/arquivamento', cursoController.alterarArquivamentoCurso)

cursoRoutes.post('/:cursoId/ofertas', cursoController.criarOfertaCursoAdmin)

cursoRoutes.patch('/:cursoId/ofertas/:ofertaId', cursoController.atualizarOfertaCursoAdmin)

export default cursoRoutes;