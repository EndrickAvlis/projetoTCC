import { z } from "zod";

const nome = z
  .string()
  .trim()
  .min(1, "O nome do voluntário é obrigatório.")
  .max(100, "O nome deve ter no máximo 100 caracteres.")
  .transform((n) =>
    n.toLowerCase().replace(/\b\p{L}/gu, (letra) => letra.toUpperCase()),
  );

const senha = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .max(50, "A senha deve ter no máximo 50 caracteres.");

const tipo = z.enum(["admin", "supervisor", "atendente"]);

const status = z.union([
  z.boolean(),
  z
    .enum(["ativo", "inativo", "true", "false"])
    .transform((v) => v === "ativo" || v === "true"),
]);

export const criarVoluntarioSchema = z.object({
  nome,
  senha: senha.optional(),
  tipo: tipo.default("atendente"),
  status: status.default(true),
});

export const atualizarVoluntarioSchema = z.object({
  nome: nome.optional(),
  senha: senha.optional(),
  tipo: tipo.optional(),
  status: status.optional(),
});

export const buscarVoluntarioSchema = z.object({
  id: z
    .coerce
    .number()
    .int("O ID deve ser um número inteiro.")
    .positive("O ID deve ser maior que zero.")
    .optional(),

  busca: z
    .string()
    .trim()
    .max(100, "O nome deve ter no máximo 100 caracteres.")
    .default("")
    .optional(),

  tipo: tipo.optional(),
  status: status.optional(),
});

export const listarVoluntariosSchema = z.object({
  query: buscarVoluntarioSchema,
});

export const criarVoluntarioRequisicaoSchema = z.object({
  body: criarVoluntarioSchema,
});

export const atualizarVoluntarioRequisicaoSchema = z.object({
  params: z.object({
    id: z.coerce
      .number()
      .int("O ID deve ser um número inteiro.")
      .positive("O ID deve ser maior que zero."),
  }),
  body: atualizarVoluntarioSchema,
});
