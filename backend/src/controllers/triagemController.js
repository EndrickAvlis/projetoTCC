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
    req.validado.params.atendimentoId,
    req.usuario.id,
    req.validado.body.documentos,
  );
  return res.status(200).json(resultado);
};

export const listarPendencias = async (req, res) => {
  const resultado = await triagemService.listarPendencias(req.validado.query.etapa);
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

export const finalizarAtendimento = async (req, res) => {
  const resultado = await triagemService.finalizarAtendimento(
    req.validado.body.senhaId, req.usuario.id,
  );
  return res.status(200).json(resultado);
};

export const iniciarAtendimento = async (req, res) => {
  const resultado = await triagemService.iniciarAtendimento(
    req.validado.body.senhaId, req.usuario.id,
  );
  return res.status(200).json(resultado);
};

export const cancelarAtendimento = async (req, res) => {
  const resultado = await triagemService.cancelarAtendimento(
    req.validado.body.senhaId, req.usuario.id,
  );
  return res.status(200).json(resultado);
};

export const recuperarAtendimento = async (req, res) => {
  const resultado = await triagemService.recuperarAtendimento(
    req.validado.params.etapa, req.usuario.id,
  );
  return res.status(200).json(resultado);
};
