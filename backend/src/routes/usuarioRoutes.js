import { Router } from "express";
import * as usuarioController from "../controllers/usuarioController.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";
import * as usuarioSchema from "../schemas/SchemaUsuario.js";
import * as auth from "../middlewares/authMiddleware.js";

const usuarioRoutes = Router();

usuarioRoutes.use(
  auth.accessValidator,
  auth.validarRole(["admin", "supervisor"]),
);

usuarioRoutes.get(
  "/",
  validarRequisicao(usuarioSchema.listarUsuariosSchema),
  usuarioController.listarUsuarios,
);

usuarioRoutes.post(
  "/",
  validarRequisicao(usuarioSchema.criarUsuarioSchema),
  usuarioController.criarUsuario,
);

usuarioRoutes.patch(
  "/:id",
  validarRequisicao(usuarioSchema.atualizarUsuarioSchema),
  usuarioController.atualizarUsuario,
);

usuarioRoutes.delete(
  "/:id",
  auth.validarRole(["admin"]),
  validarRequisicao(usuarioSchema.excluirUsuarioSchema),
  usuarioController.excluirUsuario,
);

export default usuarioRoutes;
