const FormaterCpf = (value) => {
  if (!value) return "";
  const cpf = value.replace(/\D/g, "");

  return cpf
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4")
    .substring(0, 14); // Garante o limite máximo de caracteres com pontos/hífen
};

export default FormaterCpf;