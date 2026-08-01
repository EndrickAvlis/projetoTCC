// Controller HTTP responsável por validar a etapa e responder a fila aguardando.
import {
  listarSenhasAguardando,
  chamarSenhaSelecionada,
} from "../services/filaService.js";

const etapaValida = (etapa) => {
  return ["triagem", "apm", "docs"].includes(etapa);
};

//* Recebe GET /filas?etapa=... e adapta a resposta do banco ao contrato da API.
export const listarFila = async (req, res) => {
  const { etapa } = req.query;

  if (!etapaValida(etapa)) {
    return res.status(400).json({
      message: "Informe uma etapa válida.",
      code: "ETAPA_INVALIDA",
    });
  }

  try {
    const senhas = await listarSenhasAguardando(etapa);

    return res.json({
      senhas: senhas.map((senha) => ({
        id: senha.idSenha,
        codigo: senha.senhaCodigo,
        etapaAtual: senha.etapaSenha,
        status: senha.statusSenha,
        tipoSenha: senha.tipoSenha,
      })),
      total: senhas.length,
    });
  } catch (erro) {
    console.error("Erro ao listar fila:", erro);

    return res.status(500).json({
      message: "Não foi possível carregar a fila.",
      code: "ERRO_LISTAR_FILA",
    });
  }
};

//* Recebe a senha escolhida e reserva seu atendimento na etapa informada.
export const chamarSenha = async (req, res) => {
  const { senhaId, etapa } = req.body;
  const idNormalizado = Number(senhaId);

  if (!Number.isInteger(idNormalizado) || idNormalizado <= 0) {
    return res.status(400).json({
      message: "Informe um ID de senha válido.",
      code: "SENHA_ID_INVALIDO",
    });
  }

  if (!etapaValida(etapa)) {
    return res.status(400).json({
      message: "Informe uma etapa válida.",
      code: "ETAPA_INVALIDA",
    });
  }

  try {
    const senha = await chamarSenhaSelecionada(idNormalizado, etapa);

    if (!senha) {
      return res.status(409).json({
        message: "Esta senha não está mais disponível para atendimento.",
        code: "SENHA_INDISPONIVEL",
      });
    }
    return res.status(200).json({
      senha: {
        id: senha.idSenha,
        codigo: senha.senhaCodigo,
        etapaAtual: senha.etapaSenha,
        status: senha.statusSenha,
        tipoSenha: senha.tipoSenha,
      },
    });
  } catch (erro) {
    console.error("Erro ao chamar senha: ", erro);
    return res.status(500).json({
      message: "Não foi possível chamar a senha.",
      code: "ERRO_CHAMAR_SENHA",
    });
  }
};
