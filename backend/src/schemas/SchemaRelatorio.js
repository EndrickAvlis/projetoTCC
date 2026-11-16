import { z } from "zod";
import {
  camposPeriodo,
  validarPeriodoPersonalizado,
  vazioParaUndefined,
} from "./SchemaDashboard.js";

const id = z.coerce
  .number({ error: "O ID deve ser um número válido." })
  .int("O ID deve ser um número inteiro.")
  .positive("O ID deve ser maior que zero.");

const camposFiltro = {
  ...camposPeriodo,
  cursoId: z.preprocess(vazioParaUndefined, id.optional()),
  formaPagamento: z.preprocess(
    vazioParaUndefined,
    z.enum(["dinheiro", "pix", "debito", "credito"]).optional(),
  ),
  atendenteId: z.preprocess(vazioParaUndefined, id.optional()),
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
