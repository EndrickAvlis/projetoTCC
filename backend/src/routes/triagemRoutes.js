import { Router } from "express";
import * as TriagemController from "../controllers/triagemController.js";
import * as ValidatorTriagem from "../schemas/SchemaTriagem.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as auth from "../middlewares/authMiddleware.js";

const triagemRoutes = Router();
triagemRoutes.use(auth.accessValidator, auth.validarRole(["admin", "supervisor", "atendente"]));

triagemRoutes.put("/senhas/:senhaId/aluno",
  validarRequisicao(ValidatorTriagem.vincularAlunoSchema),
  TriagemController.vincularAluno,
);

triagemRoutes.get("/pendencias",
  validarRequisicao(ValidatorTriagem.listarPendenciasSchema),
  TriagemController.listarPendencias,
);

triagemRoutes.post("/pendencias",
  validarRequisicao(ValidatorTriagem.registrarPendenciasSchema),
  TriagemController.registrarPendencias,
);

triagemRoutes.post("/pendencias/retomar",
  validarRequisicao(ValidatorTriagem.retomarAtendimentoSchema),
  TriagemController.retomarAtendimento,
);


export default triagemRoutes;
