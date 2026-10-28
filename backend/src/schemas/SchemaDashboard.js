import { z } from "zod";

  const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data no formato YYYY-MM-DD.").refine((valor) => {
  const [ano, mes, dia] = valor.split("-").map(Number);
  const dataValida = new Date(Date.UTC(ano, mes - 1, dia));
  return dataValida.getUTCFullYear() === ano && dataValida.getUTCMonth() === mes - 1 && dataValida.getUTCDate() === dia;}, "Informe uma data válida.");