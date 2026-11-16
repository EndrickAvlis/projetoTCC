import { z } from "zod";
import { formatarNome } from "../utils/formatarNome.js";

const TELAS_COM_GUICHE = ["triagem", "apm", "docs"];

const loginSchema = z
  .object({
    nome: z
      .string({ error: "O nome de usuário é obrigatório." })
      .transform(formatarNome)
      .pipe(
        z
          .string()
          .min(1, "O nome de usuário é obrigatório.")
          .max(100, "O nome deve ter no máximo 100 caracteres."),
      ),
    senha: z
      .string({ error: "A senha é obrigatória." })
      .min(1, "A senha é obrigatória.")
      .max(50, "A senha deve ter no máximo 50 caracteres."),
    guiche: z.preprocess(
      (valor) => {
        if (valor === null || valor === undefined) return undefined;
        if (typeof valor === "string") {
          const limpo = valor.trim();
          return limpo === "" ? undefined : limpo;
        }
        return valor;
      },
      z
        .string({ error: "O guichê deve ser um texto válido." })
        .max(4, "O guichê deve ter no máximo 4 caracteres.")
        .regex(
          /^[a-zA-Z0-9]+$/,
          "Informe apenas números ou letras para o guichê (ex: 01, 2, A).",
        )
        .optional(),
    ),
    tela: z.enum(["triagem", "apm", "docs", "admin", "secretaria"], {
      error: "Selecione uma tela de acesso válida.",
    }),
  })
  .superRefine((dados, ctx) => {
    if (TELAS_COM_GUICHE.includes(dados.tela) && !dados.guiche) {
      ctx.addIssue({
        code: "custom",
        path: ["guiche"],
        message: "O guichê é obrigatório para esta tela.",
      });
    }
  })
  .transform((dados) => ({
    ...dados,
    guiche: TELAS_COM_GUICHE.includes(dados.tela) ? dados.guiche : undefined,
  }));

export const realizarLoginRequisicaoSchema = z.object({
  body: loginSchema,
});
