import FilaService from "../services/filaService.js";
import SenhaService from "../services/senhaService.js";
import { mapearAluno } from "./alunoController.js";
import { painelService } from "../services/painelService.js";
import AppError from "../errors/AppError.js";

const filaService = new FilaService();
const senhaService = new SenhaService();

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

  if (etapa !== req.usuario.tela) {
    throw etapasDiferentes();
  }

  const senha = await filaService.chamarSenhaSelecionada(senhaId, etapa);

  painelService.mostrarSenhaChamada({
    codigo: senha.senhaCodigo,
    posto: etapa,
    guiche: req.usuario?.guiche ?? null,
  });

  return res.json({
    senha: {
      ...senhaResposta(senha),
      aluno: senha.aluno ? mapearAluno(senha.aluno) : null,
    },
  });
};

export const rechamarSenha = async (req, res) => {
  const { senhaId, etapa } = req.validado.body;
  const guiche = req.usuario.guiche;

  const senha = await senhaService.buscarPorId(senhaId);

  if (!senha) {
    throw senhaNaoEncontrada();
  }

  if (senha.etapaSenha !== etapa) {
    throw etapasDiferentes();
  }

  painelService.mostrarSenhaChamada({
    codigo: senha.senhaCodigo,
    posto: etapa,
    guiche: req.usuario?.guiche ?? null,
  });

  return res.status(200).json({
    mensagem: "Senha rechamda com sucesso.",
  });
};

const senhaNaoEncontrada = () =>
  new AppError("Senha não encontrada.", {
    status: 404,
    code: "SENHA_NAO_ENCONTRADA",
  });

const etapasDiferentes = () =>
  new AppError("A senha e o usuario estão em etapas diferentes", {
    status: 403,
    code: "ETAPAS_DIFERENTES",
  });
