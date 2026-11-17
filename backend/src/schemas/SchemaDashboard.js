import { z } from "zod";

export const vazioParaUndefined = (valor) => (valor === "" ? undefined : valor);

const dataSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data no formato YYYY-MM-DD.")
  .refine((valor) => {
    const [ano, mes, dia] = valor.split("-").map(Number);
    const dataValida = new Date(Date.UTC(ano, mes - 1, dia));
    return (
      dataValida.getUTCFullYear() === ano &&
      dataValida.getUTCMonth() === mes - 1 &&
      dataValida.getUTCDate() === dia
    );
  }, "Informe uma data válida.");

export const camposPeriodo = {
  periodo: z
    .enum(["TODO", "HOJE", "SEMANA", "MES", "PERSONALIZADO"])
    .default("TODO"),
  dataInicio: z.preprocess(vazioParaUndefined, dataSchema.optional()),
  dataFim: z.preprocess(vazioParaUndefined, dataSchema.optional()),
};

export const validarPeriodoPersonalizado = (query, contexto) => {
  if (query.periodo !== "PERSONALIZADO") return;

  if (!query.dataInicio || !query.dataFim) {
    contexto.addIssue({
      code: "custom",
      path: ["dataInicio"],
      message: "Informe as datas inicial e final.",
    });
  } else if (query.dataInicio > query.dataFim) {
    contexto.addIssue({
      code: "custom",
      path: ["dataFim"],
      message: "A data inicial deve ser anterior ou igual à data final.",
    });
  }
};

export const obterDashboardSchema = z.object({
  query: z.object(camposPeriodo).superRefine(validarPeriodoPersonalizado),
});
