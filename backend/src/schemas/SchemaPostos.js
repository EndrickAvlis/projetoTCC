import { z } from "zod";

export const listarAtendimentoSchema = z.object({
    query: z.object({
        tipoPeriodo: z
        .enum(["HOJE", "SEMANA", "MES", "PERSONALIZADO"])
        .optional()
        .default("HOJE"),
    dataInicio: z
        .iso.date()
        .optional(),
    dataFim: z
        .iso.date()
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

export const listarAuditoriaSchema = z.object({
    query: z.object({
        busca: z
            .string()
            .max(100, "A pesquisa deve ter menos de 100 caracteres")
            .optional()
            .default(""),
        status: z
            .enum(["finalizada", "cancelada"])
            .optional(),
        tipoPeriodo: z
            .enum(["HOJE", "SEMANA", "MES", "PERSONALIZADO"])
            .optional()
            .default("HOJE"),
        dataInicio: z
            .iso.date()
            .optional(),
        dataFim: z
            .iso.date()
            .optional(),
        pagina: z
            .coerce.number()
            .int()
            .positive()
            .default(1),
        limite: z
            .coerce.number()
            .int()
            .positive()
            .default(7)
    })
});

export const tranferenciaPostoSchema = z.object({
    body: z.object({
        posto: z
            .enum(["triagem", "apm", "docs"])
    }),
    params: z.object({
        id: z
            .coerce.number()
            .int()
            .positive()
    })
});

export const cancelamentoSchema = z.object({
    params: z.object({
        id: z
            .coerce.number()
            .int()
            .positive()
    })
})