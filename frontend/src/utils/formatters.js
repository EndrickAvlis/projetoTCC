// Funções reutilizáveis para exibir CPF e valores monetários no padrão brasileiro.

export const formatarMoeda = (valor = 0) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export const formatarDecimalParaCampo = (valor = 0) =>
  valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const valorTextoParaDecimal = (valor) => {
  const texto = String(valor ?? "").trim();
  if (!texto) return 0;

  const normalizado = texto.includes(",")
    ? texto.replaceAll(".", "").replace(",", ".")
    : texto;
  const numero = Number(normalizado);

  return Number.isFinite(numero) ? Math.max(0, Math.round(numero * 100) / 100) : 0;
};

export const ehValorMonetarioEmDigitacao = (valor) =>
  /^\d*(?:[,.]\d{0,2})?$/.test(valor);

export const formatarSenha = (codigo) => {
  const numero = Number(codigo);

  if (!Number.isInteger(numero) || numero < 1) {
    return "";
  }

  return `A${String(numero).padStart(3, "0")}`;
};

export const formatarHora = (dataIso) => {
  if (!dataIso) return "";
  try {
    return new Date(dataIso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return dataIso;
  }
};
