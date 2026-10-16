import { Router } from "express";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as ValidatorAtendimento from "../schemas/SchemaAtendimento.js";
import * as auth from "../middlewares/authMiddleware.js";
import * as AtendimentoController from "../controllers/atendimentoController.js";


const atendimentoRoutes = Router();

atendimentoRoutes.use(auth.accessValidator, auth.validarRole(["admin", "supervisor", "atendente"]));

atendimentoRoutes.post("/iniciar/:id", 
    validarRequisicao(ValidatorAtendimento.idAtendimentoSchema), 
    AtendimentoController.iniciarAtendimento
);

atendimentoRoutes.get("/recuperar/:etapa",
    validarRequisicao(ValidatorAtendimento.recuperarAtendimentoSchema),
    AtendimentoController.recuperarAtendimento
);

atendimentoRoutes.patch("/finalizar/:id",
    validarRequisicao(ValidatorAtendimento.idAtendimentoSchema),
    AtendimentoController.finalizarAtendimento
);

atendimentoRoutes.post("/cancelar/:id",
    validarRequisicao(ValidatorAtendimento.idAtendimentoSchema),
    AtendimentoController.cancelarAtendimento
 );





export default atendimentoRoutes;