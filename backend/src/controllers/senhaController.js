import SenhaService from "../services/SenhaService.js";

const senhaService = new SenhaService();

const senhaResposta = (senha) => ({
  id: senha.idSenha,
  numero: senha.senhaCodigo,
  emitidaEm: senha.dataHoraInicioSenha,
  etapa: senha.etapaSenha,
  status: senha.statusSenha,
  prioritaria: Boolean(senha.tipoSenha),
});

export const emitirSenha = async (_req, res) => {
  const senha = await senhaService.criarSenha();

  return res.status(201).json({
    senha: senhaResposta(senha),
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
    senha: senhaResposta(senha),
  });
};
