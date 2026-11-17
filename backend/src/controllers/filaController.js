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
  });
};

export const chamarSenha = async (req, res) => {
  const { senhaId, etapa } = req.validado.body;
  const idUsuario = req.usuario.id;

  if (etapa !== req.usuario.tela) {
    throw etapasDiferentes();
  }

  const { senha, historico } = await filaService.chamarSenhaSelecionada(
    senhaId,
    etapa,
    idUsuario,
  );

  painelService.mostrarSenhaChamada({
    codigo: senha.senhaCodigo,
    posto: etapa,
    guiche: req.usuario?.guiche ?? null,
    prioritaria: Boolean(senha.tipoSenha),
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

  if (etapa !== req.usuario.tela) {
    throw etapasDiferentes();
  }

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
    prioritaria: Boolean(senha.tipoSenha),
  });

  return res.status(200).json({
    mensagem: "Senha rechamda com sucesso.",
  });
};

export const listarHistorico = async (req, res) => {
  const { etapa } = req.validado.query;
  const senhas = await historicoSenhaService.listarChamadaHoje(etapa);

  return res.json({
    mensagem: "Senhas chamadas hoje listadas com sucesso",
    senhas: senhas.map(senhaResposta),
  })
} 

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
