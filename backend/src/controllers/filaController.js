import FilaService from "../services/FilaService.js";

const filaService = new FilaService();

const senhaResposta = (senha) => ({
  id: senha.idSenha,
  codigo: senha.senhaCodigo,
  etapaAtual: senha.etapaSenha,
  status: senha.statusSenha,
  tipoSenha: senha.tipoSenha,
});

export const listarFila = async (req, res) => {
  const { etapa } = req.validado.query;
  const senhas = await filaService.listarSenhasAguardando(etapa);

  return res.json({
    senhas: senhas.map(senhaResposta),
    total: senhas.length,
  });
};

export const chamarSenha = async (req, res) => {
  const { senhaId, etapa } = req.validado.body;
  const senha = await filaService.chamarSenhaSelecionada(senhaId, etapa);

  return res.json({
    senha: senhaResposta(senha),
  });
};
