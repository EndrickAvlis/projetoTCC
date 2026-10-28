import { z } from "zod";

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data no formato YYYY-MM-DD.").refine((valor) => {
  const [ano, mes, dia] = valor.split("-").map(Number);
  const dataValida = new Date(Date.UTC(ano, mes - 1, dia));
  return dataValida.getUTCFullYear() === ano && dataValida.getUTCMonth() === mes - 1 && dataValida.getUTCDate() === dia;
}, "Informe uma data válida.");

export const obterDashboardSchema = z.object({
  query: z.object({
    periodo: z.enum(["todo", "hoje", "semana", "mes", "personalizado"]).default("todo"),
    dataInicio: data.optional(),
    dataFim: data.optional(),
  }).superRefine((query, contexto) => {
    if (query.periodo !== "personalizado") return;
    if (!query.dataInicio || !query.dataFim) {
      contexto.addIssue({ code: "custom", message: "Informe as datas inicial e final.", path: ["dataInicio"] });
    } else if (query.dataInicio > query.dataFim) {
      contexto.addIssue({ code: "custom", message: "A data inicial deve ser anterior ou igual à data final.", path: ["dataFim"] });
    }
  }),
});
