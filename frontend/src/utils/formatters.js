// Funções reutilizáveis para exibir CPF e valores monetários no padrão brasileiro.
const FormaterCpf = (value) => {
  if (!value) return "";
  const cpf = value.replace(/\D/g, "");

  return cpf
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4")
    .substring(0, 14); // Garante o limite máximo de caracteres com pontos/hífen
};

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

export default FormaterCpf;
