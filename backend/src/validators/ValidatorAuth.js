import { z } from "zod";

const loginSchema = z.object({
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
})

const refreshTokenSchema = z.object({
    token: z
    .string(),
})

export const realizarLoginRequisicaoSchema = z.object({
  body: loginSchema,
})