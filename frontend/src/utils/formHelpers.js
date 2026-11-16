const TECLAS_NAO_INTEIRAS = new Set(["-", "+", "e", "E", ".", ","]);

export const bloquearTeclasNaoInteiras = (evento) => {
  if (TECLAS_NAO_INTEIRAS.has(evento.key)) {
    evento.preventDefault();
  }
};

export const validarQuantidadeInteira = (
  valor,
  {
    mensagemVazio = "Informe a quantidade.",
    minimo = 0,
    mensagemMinimo = "A quantidade deve ser maior ou igual a 0.",
    maximo = 99999,
    mensagemMaximo = "A quantidade máxima permitida é 99.999.",
  } = {},
) => {
  if (String(valor ?? "").trim() === "") {
    return mensagemVazio;
  }

  const quantidade = Number(valor);

  if (!Number.isInteger(quantidade)) {
    return "Informe uma quantidade inteira.";
  }

  if (quantidade < minimo) {
    return mensagemMinimo;
  }

  if (quantidade > maximo) {
    return mensagemMaximo;
  }

  return "";
};
