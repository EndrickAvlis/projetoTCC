import UsuarioService from "../services/usuarioService.js";

const usuarioService = new UsuarioService();

const mapearUsuario = (usuario) => {
  if (!usuario) return null;
  return {
    id: usuario.idVoluntario,
    nome: usuario.nomeVoluntario,
    tipo: usuario.tipoVoluntario,
    status: usuario.statusVoluntario,
  };
};

export const listarUsuarios = async (req, res) => {
  const usuarios = await usuarioService.listar(req.validado.query);

  return res.status(200).json({
    usuarios: usuarios.map(mapearUsuario),
    total: usuarios.length,
  });
};

export const criarUsuario = async (req, res) => {
  const usuario = await usuarioService.criar(req.validado.body);

  return res.status(201).json({
    usuario: mapearUsuario(usuario),
  });
};

export const atualizarUsuario = async (req, res) => {
  const { id } = req.validado.params;
  const usuario = await usuarioService.atualizar(
    id,
    req.validado.body,
  );

  return res.status(200).json({
    usuario: mapearUsuario(usuario),
  });
};

export const excluirUsuario = async (req, res) => {
  const { id } = req.validado.params;
  const usuario = await usuarioService.excluir(id);

  return res.status(200).json({
    usuario: mapearUsuario(usuario),
  });
};