import { emitirSenha as criarSenha } from "../services/senhaService.js";

export const emitirSenha = async (_req, res) => {
  try {
    const senha = await criarSenha();

    return res.status(201).json({
      senha: {
        id: senha.idSenha,
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
