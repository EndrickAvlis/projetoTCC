import VoluntarioService from "../services/VoluntarioService.js";

const voluntarioService = new VoluntarioService();

export const listarVoluntarios = async (req, res) => {
  const voluntarios = await voluntarioService.listar(req.validado.query);

  return res.status(200).json({
    mensagem: voluntarios,
  });
};

export const criarVoluntario = async (req, res) => {
  const voluntario = await voluntarioService.criar(req.validado.body);

  return res.status(201).json({
    mensagem: voluntario,
  });
};

export const atualizarVoluntario = async (req, res) => {
  const { idVoluntario } = req.validado.params;
  const voluntario = await voluntarioService.atualizar(
    idVoluntario,
    req.validado.body,
  );

  return res.status(202).json({
    mensagem: voluntario,
  });
};
