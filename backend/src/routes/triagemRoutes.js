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

triagemRoutes.get("/filas/pendencias",
  validarRequisicao(ValidatorTriagem.listarPendenciasSchema),
  TriagemController.listarPendencias,
);

triagemRoutes.post("/atendimentos/:atendimentoId/pendencias",
  validarRequisicao(ValidatorTriagem.registrarPendenciasSchema),
  TriagemController.registrarPendencias,
);

triagemRoutes.post("/atendimento/retomar",
  validarRequisicao(ValidatorTriagem.retomarAtendimentoSchema),
  TriagemController.retomarAtendimento,
);

//remover
triagemRoutes.post("/atendimentos/iniciar",
  validarRequisicao(ValidatorTriagem.senhaAtendimentoSchema),
  TriagemController.iniciarAtendimento,
);

//remover
triagemRoutes.post("/atendimento/finalizar",
  validarRequisicao(ValidatorTriagem.senhaAtendimentoSchema),
  TriagemController.finalizarAtendimento,
);

//remover
triagemRoutes.post("/atendimento/cancelar",
  validarRequisicao(ValidatorTriagem.senhaAtendimentoSchema),
  TriagemController.cancelarAtendimento,
);

triagemRoutes.get("/atendimentos/recuperar/:etapa",
  validarRequisicao(ValidatorTriagem.recuperarAtendimentoSchema),
  TriagemController.recuperarAtendimento,
);

//remover
triagemRoutes.post("/atendimentos/finalizar",
  validarRequisicao(ValidatorTriagem.senhaAtendimentoSchema),
  TriagemController.finalizarAtendimento,
);

//remover
triagemRoutes.post("/atendimentos/cancelar",
  validarRequisicao(ValidatorTriagem.senhaAtendimentoSchema),
  TriagemController.cancelarAtendimento,
);

export default triagemRoutes;
