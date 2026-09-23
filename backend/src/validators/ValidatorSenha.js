import { z } from "zod";

export const alterarPrioridadeSenhaSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  body: z.object({
    tipoSenha: z.boolean(),
  }),
});
