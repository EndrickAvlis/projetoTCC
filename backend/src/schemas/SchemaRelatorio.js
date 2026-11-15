import { z } from "zod";

const vazioParaUndefined = (valor) => (valor === "" ? undefined : valor);

const id = z.coerce
  .number({ error: "O ID deve ser um número válido." })
  .int("O ID deve ser um número inteiro.")
  .positive("O ID deve ser maior que zero.");

const data = z
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

const camposFiltro = {
  periodo: z
    .enum(["TODO", "HOJE", "SEMANA", "MES", "PERSONALIZADO"])
    .default("TODO"),
  dataInicio: z.preprocess(vazioParaUndefined, data.optional()),
  dataFim: z.preprocess(vazioParaUndefined, data.optional()),
  cursoId: z.preprocess(vazioParaUndefined, id.optional()),
  formaPagamento: z.preprocess(
    vazioParaUndefined,
    z.enum(["dinheiro", "pix", "debito", "credito"]).optional(),
  ),
  atendenteId: z.preprocess(vazioParaUndefined, id.optional()),
};

const validarPeriodoPersonalizado = (query, contexto) => {
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

export const obterDadosRelatorioSchema = z.object({
  query: z
    .object({
      ...camposFiltro,
      pagina: z.coerce
        .number()
        .int("A página deve ser um número inteiro.")
        .positive("A página deve ser maior que zero.")
        .default(1),
      limite: z.coerce
        .number()
        .int("O limite deve ser um número inteiro.")
        .positive("O limite deve ser maior que zero.")
        .max(100, "O limite máximo é de 100 registros por página.")
        .default(10),
    })
    .superRefine(validarPeriodoPersonalizado),
});

export const exportarRelatorioSchema = z.object({
  query: z.object(camposFiltro).superRefine(validarPeriodoPersonalizado),
});

export const detalheRelatorioSchema = z.object({
  params: z.object({ id }),
});
