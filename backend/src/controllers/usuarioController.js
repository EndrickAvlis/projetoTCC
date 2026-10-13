import UsuarioService from "../services/usuarioService.js";

const usuarioService = new UsuarioService();

export const listarVoluntarios = async (req, res) => {
  const voluntarios = await usuarioService.listar(req.validado.query);

  return res.status(200).json({
    usuarios: voluntarios,
    total: voluntarios.length,
  });
};


export const criarVoluntario = async (req, res) => {
  const voluntario = await usuarioService.criar(req.validado.body);

  return res.status(201).json({
    mensagem: voluntario,
  });
};

export const atualizarVoluntario = async (req, res) => {
  const { id } = req.validado.params;
  const voluntario = await usuarioService.atualizar(
    id,
    req.validado.body,
  );

  return res.status(202).json({
    mensagem: voluntario,
  });
};
