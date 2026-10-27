import FilaService from "../services/filaService.js";
import { mapearAluno } from "./alunoController.js";
const filaService = new FilaService();



const senhaResposta = (senha) => ({
  id: senha.idSenha,
  codigo: senha.senhaCodigo,
  etapa: senha.etapaSenha,
  status: senha.statusSenha,
  prioritaria: Boolean(senha.tipoSenha),
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
    senha: {
      ...senhaResposta(senha),
      aluno: senha.aluno ? mapearAluno(senha.aluno) : null,
    },
  });
};

