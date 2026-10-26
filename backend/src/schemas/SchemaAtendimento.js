import { z } from "zod";

export const idAtendimentoSchema = z.object({
    body: z.object({
        senhaId: z
        .coerce.number()
        .int()
        .positive(),
    }),
})

export const recuperarAtendimentoSchema = z.object({
    params: z.object({
        etapa: z
            .enum(["triagem", "apm", "docs"]),
    }),
})