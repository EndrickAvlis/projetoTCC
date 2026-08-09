import * as senhaService from "../services/SenhaService.js";

const mapearSenhaResposta = (senha) => ({
  idSenha: senha.idSenha,
  codigo: senha.senhaCodigo,
  emitidaEm: senha.dataHoraInicioSenha,
  etapaAtual: senha.etapaSenha,
  status: senha.statusSenha,
  tipoSenha: senha.tipoSenha,
});

export const emitirSenha = async (_req, res) => {
  const senha = await senhaService.criarSenha();

  return res.status(201).json({
    senha: mapearSenhaResposta(senha),
  });
};

export const alterarPrioridadeSenha = async (req, res) => {
  const { id } = req.validado.params;
  const { tipoSenha } = req.validado.body;
  const senha = await senhaService.alterarPrioridadeSenha(id, tipoSenha);

  return res.json({
    message: tipoSenha
      ? "Prioridade ativada com sucesso."
      : "Prioridade desativada com sucesso.",
    senha: mapearSenhaResposta(senha),
  });
};
