export const validarRequisicao = (schema) => (req, res, next) => {
  const resultado = schema.safeParse({
    body: req.body ?? {},
    params: req.params ?? {},
    query: req.query ?? {},
  });

  if (!resultado.success) {
    return res.status(400).json({
      message: "Dados da requisição inválidos.",
      code: "DADOS_INVALIDOS",
      details: resultado.error.issues.map((erro) => ({
        campo: erro.path.join("."),
        message: erro.message,
      })),
    });
  }

  req.validado = resultado.data;
  return next();
};
