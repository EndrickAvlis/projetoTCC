const palavrasMinusculas = new Set([
  "a",
  "as",
  "o",
  "os",
  "de",
  "da",
  "das",
  "do",
  "dos",
  "e",
  "em",
  "na",
  "nas",
  "no",
  "nos",
  "para",
  "por",
]);

const capitalizarSegmento = (segmento) => {
  if (!segmento) return "";
  if (segmento.startsWith("d'") && segmento.length > 2) {
    return (
      "d'" +
      segmento.charAt(2).toLocaleUpperCase("pt-BR") +
      segmento.slice(3)
    );
  }
  return segmento.charAt(0).toLocaleUpperCase("pt-BR") + segmento.slice(1);
};

export const formatarNome = (texto) => {
  const limpo = texto.trim();
  if (!limpo) return "";

  return limpo
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .map((palavra, indice) => {
      if (indice > 0 && palavrasMinusculas.has(palavra)) return palavra;
      return palavra.split("-").map(capitalizarSegmento).join("-");
    })
    .join(" ");
};

