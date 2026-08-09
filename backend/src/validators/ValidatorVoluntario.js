import { z } from "zod";


export const criarVoluntarioSchema = z.object({
    nomeVoluntario: z
        .string()
        .trim()
        .min(1, "O nome do voluntário é obrigatório.")
        .max(100, "O nome deve ter no máximo 100 caracteres.")
        .transform(nome =>
            nome
                .toLowerCase()
                .replace(/\b\p{L}/gu, letra => letra.toUpperCase())
        ),

    senhaVoluntario: z
        .string()
        .min(8, "A senha deve ter no mínimo 8 caracteres.")
        .max(50, "A senha deve ter no máximo 50 caracteres."),

    tipoVoluntario: z
        .enum(["admin", "supervisor", "atendente"])
        .default("atendente"),

    statusVoluntario: z
        .string()
        .min(1, "O status é obrigatório.")
        .max(20)
        .default("ativo")
});

export const buscarVoluntarioSchema = z.object({
    idVoluntario: z
        .coerce
        .number()
        .int("O ID deve ser um número inteiro.")
        .positive("O ID deve ser maior que zero.")
        .optional(),

    nomeVoluntario: z
        .string()
        .trim()
        .max(100, "O nome deve ter no máximo 100 caracteres.")
        .transform(nome =>
            nome
                .toLowerCase()
                .replace(/\b\p{L}/gu, letra => letra.toUpperCase())
        )
        .default("")
        .optional(),

    tipoVoluntario: z
        .enum(["admin", "supervisor", "atendente"])
        .optional(),

    statusVoluntario: z
        .string()
        .max(20)
        .default("ativo")
        .optional()
})

export const atualizarVoluntarioSchema = criarVoluntarioSchema.partial();