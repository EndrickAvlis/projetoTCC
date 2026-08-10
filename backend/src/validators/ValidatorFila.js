import { z } from "zod";

const etapas = ["triagem", "apm", "docs"];

const etapaSchema = z.enum(etapas, {
  error: "Informe uma etapa válida.",
});

export const listarFilaSchema = z.object({
  query: z.object({
    etapa: etapaSchema,
  }),
});

export const chamarSenhaSchema = z.object({
  body: z.object({
    senhaId: z.coerce
      .number()
      .int("O ID da senha deve ser um número inteiro.")
      .positive("O ID da senha deve ser maior que zero."),

    etapa: etapaSchema,
  }),
});
