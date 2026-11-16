import { z } from "zod";
import { formatarNome } from "../utils/formatarNome.js";

const nome = z
  .string({ error: "O nome de usuário é obrigatório." })
  .transform(formatarNome)
  .pipe(
    z
      .string()
      .min(1, "O nome de usuário é obrigatório.")
      .max(100, "O nome deve ter no máximo 100 caracteres."),
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

const dadosCriarUsuario = z.object({
  nome,
  senha,
  tipo: tipo.default("atendente"),
  status: status.default(true),
});

const dadosAtualizarUsuario = z
  .object({
    nome: nome.optional(),
    senha: senha.optional(),
    tipo: tipo.optional(),
    status: status.optional(),
  })
  .refine((dados) => Object.values(dados).some((v) => v !== undefined), {
    message: "Informe ao menos um campo para atualização.",
  });

const id = z.coerce
  .number()
  .int("O ID deve ser um número inteiro.")
  .positive("O ID deve ser maior que zero.");

export const listarUsuariosSchema = z.object({
  query: z.object({
    id: id.optional(),
    busca: z
      .string()
      .trim()
      .max(100, "O nome deve ter no máximo 100 caracteres.")
      .default("")
      .optional(),
    tipo: z.preprocess((v) => (v === "" ? undefined : v), tipo.optional()),
    status: z.preprocess((v) => (v === "" ? undefined : v), status.optional()),
  }),
});

export const criarUsuarioSchema = z.object({
  body: dadosCriarUsuario,
});

export const atualizarUsuarioSchema = z.object({
  params: z.object({
    id,
  }),
  body: dadosAtualizarUsuario,
});
