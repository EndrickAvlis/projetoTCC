import { z } from "zod";

const id = z.coerce
  .number()
  .int("O ID deve ser um número inteiro.")
  .positive("O ID deve ser maior que zero.");

const nomeAluno = z
  .string({ error: "Informe o nome do aluno." })
  .trim()
  .min(1, "Informe o nome do aluno.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");

export const criarAlunoSchema = z.object({
  body: z.object({
    nome: nomeAluno,
    anoProcesso: z.coerce.number().int().positive().optional(),
    semestreProcesso: z.coerce.number().int().positive().optional(),
    escolaridadePublica: z.boolean().optional().default(false),
    cidade: z.string().trim().max(100).optional(),
    sexo: z.string().trim().max(20).optional(),
  }),
});

export const listarAlunosSchema = z.object({
  query: z.object({
    nome: z.string().trim().optional().default(""),
  }),
});

export const consultarAlunoSchema = z.object({
  params: z.object({
    id: id,
  }),
});

export const editarAlunoSchema = z.object({
  params: z.object({
    id: id,
  }),
  body: z.object({
    nome: nomeAluno,
  }),
});

export const alterarStatusAlunoSchema = z.object({
  params: z.object({
    id: id,
  }),
  body: z.object({
    arquivado: z.boolean(),
  }),
});

export const adicionarMatriculaSchema = z.object({
  params: z.object({
    id: id,
  }),
  body: z.object({
    cursoId: id,
  }),
});

export const editarMatriculaSchema = z.object({
  params: z.object({
    id: id,
  }),
  body: z.object({
    cursoId: id.optional(),
  }),
});

export const removerMatriculaSchema = z.object({
  params: z.object({
    id: id,
  }),
});