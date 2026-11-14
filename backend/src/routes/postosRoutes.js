import { Router } from "express";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as auth from "../middlewares/authMiddleware.js";
import * as postosController from "../controllers/postosController.js";
import * as validatorPostos from "../schemas/SchemaPostos.js";

const postosRoutes = Router();

//postosRoutes.use(auth.accessValidator, auth.validarRole(["admin", "supervisor"]));

postosRoutes.get("/filas",
    postosController.listarTodasAsFilas
);

postosRoutes.get("/atendimento",
    validarRequisicao(validatorPostos.listarAtendimentoSchema),
    postosController.listarAtendimento
);

postosRoutes.get("/auditoria",
    validarRequisicao(validatorPostos.listarAuditoriaSchema),
    postosController.listarAuditoria
);

postosRoutes.patch("/:id/transferencia",
    validarRequisicao(validatorPostos.tranferenciaPostoSchema),
    postosController.trocarDePosto
);

postosRoutes.patch("/:id/cancelamento",
    validarRequisicao(validatorPostos.cancelamentoSchema),
    postosController.cancelarSenha
)
export default postosRoutes;