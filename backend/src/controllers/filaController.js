import FilaService from "../services/filaService.js";
import SenhaService from "../services/senhaService.js";
import { mapearAluno } from "../mappers/alunoMapper.js";
import { painelService } from "../services/painelService.js";
import AppError from "../errors/AppError.js";
import HistoricoSenhaService from "../services/historicoSenhaService.js";

const filaService = new FilaService();
const senhaService = new SenhaService();
const historicoSenhaService = new HistoricoSenhaService();

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
  const idUsuario = req.usuario.id;

  if (etapa !== req.usuario.tela) {
    throw etapasDiferentes();
  }

  const atendimentoAberto = await historicoSenhaService.listarAtendimentoAberto(
    idUsuario,
    etapa,
  );

  if (atendimentoAberto) {
    throw new AppError("Você já possui um atendimento aberto nesta etapa.", {
      status: 409,
      code: "ATENDIMENTO_ABERTO",
    });
  }

  const senha = await filaService.chamarSenhaSelecionada(senhaId, etapa);

  const historico = await historicoSenhaService.criar({
    codSenha: senha.idSenha,
    codVoluntario: idUsuario,
    etapaHistorico: etapa,
  });

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
    atendimento: {
      idHistorico: historico.idHistorico,
      iniciadoEm: historico.dataHoraInicioHistorico,
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

  if (senha.statusSenha !== "chamada") {
    throw new AppError("Apenas senhas chamadas podem ser rechamadas.", {
      status: 400,
      code: "SENHA_NAO_CHAMADA",
    });
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
