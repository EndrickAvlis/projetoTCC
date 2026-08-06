import * as senhaService from "../services/senhaService.js";

export const emitirSenha = async (_req, res) => {
  try {
    const senha = await senhaService.criarSenha();

    return res.status(201).json({
      senha: {
        idSenha: senha.idSenha,
        codigo: senha.senhaCodigo,
        emitidaEm: senha.dataHoraInicioSenha,
        etapaAtual: senha.etapaSenha,
        status: senha.statusSenha,
        tipoSenha: senha.tipoSenha,
      },
    });
  } catch (erro) {
    console.error("Erro ao emitir senha: ", erro);

    return res.status(500).json({
      message: "Não foi possível emitir a senha.",
      code: "ERRO_EMITIR_SENHA",
    });
  }
};

export const alterarPrioridadeSenha = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { tipoSenha } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Id da senha inválido."
      });
    }

    if (typeof tipoSenha !== "boolean") {
      return res.status(400).json({
        message: "O campo de prioridade deve ser um boolean."
      });
    }

    const senha = await senhaService.alterarPrioridadeSenha(
      id,
      tipoSenha,
    )

    return res.status(200).json({
      message: tipoSenha
        ? "Prioridade ativada com sucesso."
        : "Prioridade desativada com sucesso.",
      senha: {
        idSenha: senha.idSenha,
        codigo: senha.senhaCodigo,
        emitidaEm: senha.dataHoraInicioSenha,
        etapaAtual: senha.etapaSenha,
        status: senha.statusSenha,
        tipoSenha: senha.tipoSenha,
      },
    });

  } catch (error) {
    if (error.message === "SENHA_NAO_ENCONTRADA") {
      return res.status(404).json({
        mensagem: "Senha não encontrada.",
      });
    }
    if (error.message === "SENHA_FINALIZADA") {
      return res.status(409).json({
        mensagem: "Não é possível alterar uma senha finalizada.",
      });
    }
    console.error(error);
    return res.status(500).json({
      message: "Erro interno ao alterar a prioridade da senha."
    })
  }
}
