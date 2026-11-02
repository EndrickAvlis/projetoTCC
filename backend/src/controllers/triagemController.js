import TriagemService from "../services/triagemService.js";

const triagemService = new TriagemService();

export const vincularAluno = async (req, res) => {
  const resultado = await triagemService.vincularAluno(
    req.validado.params.senhaId,
    req.usuario.id,
    req.validado.body,
  );
  return res.status(200).json(resultado);
};

export const registrarPendencias = async (req, res) => {
  const resultado = await triagemService.registrarPendencias(
    req.validado.body.atendimentoId,
    req.usuario.id,
    req.validado.body.documentos,
  );
  return res.status(200).json(resultado);
};

export const listarPendencias = async (req, res) => {
  const resultado = await triagemService.listarPendencias(
    req.validado.query.etapa,
  );
  return res.status(200).json(resultado);
};

export const retomarAtendimento = async (req, res) => {
  const resultado = await triagemService.retomarAtendimento(
    req.validado.body.senhaId,
    req.validado.body.etapa,
    req.usuario.id,
  );
  return res.status(200).json(resultado);
};
