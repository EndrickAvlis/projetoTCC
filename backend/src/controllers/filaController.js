import {
  listarSenhasAguardando,
  chamarSenhaSelecionada,
} from "../services/FilaService.js";

const mapearSenhaResposta = (senha) => ({
  id: senha.idSenha,
  codigo: senha.senhaCodigo,
  etapaAtual: senha.etapaSenha,
  status: senha.statusSenha,
  tipoSenha: senha.tipoSenha,
});

export const listarFila = async (req, res) => {
  const { etapa } = req.validado.query;
  const senhas = await listarSenhasAguardando(etapa);

  return res.json({
    senhas: senhas.map(mapearSenhaResposta),
    total: senhas.length,
  });
};

export const chamarSenha = async (req, res) => {
  const { senhaId, etapa } = req.validado.body;
  const senha = await chamarSenhaSelecionada(senhaId, etapa);

  return res.json({
    senha: mapearSenhaResposta(senha),
  });
};
