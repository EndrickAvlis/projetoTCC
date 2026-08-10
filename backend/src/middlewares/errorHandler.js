import AppError from "../errors/AppError.js";

export const errorHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    const resposta = {
      message: error.message,
      code: error.code,
    };

    if (error.details) {
      resposta.details = error.details;
    }

    return res.status(error.status).json(resposta);
  }

  console.error("Erro inesperado:", error);

  return res.status(500).json({
    message: "Não foi possível concluir a operação.",
    code: "ERRO_INTERNO",
  });
};
