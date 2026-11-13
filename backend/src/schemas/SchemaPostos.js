import { z } from "zod";

export const listarAtendimentoSchema = z.object({
    query: z.object({
        tipoPeriodo: z
        .enum(["hoje", "semana", "mes", "personalizado"])
        .optional(),
    dataInicio: z
        .date()
        .optional(),
    dataFim: z
        .date()
        .optional(),
    cursoId: z
        .coerce.number()
        .int()
        .positive()
        .optional(),
    periodoCurso: z
        .enum(["manha", "tarde", "noite", "integral", "online"])
        .optional(),
    }),
});