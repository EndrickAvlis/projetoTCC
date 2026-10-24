import { z } from "zod";

const periodosValidos = ["manha", "tarde", "noite", "integral", "online"];
const statusAlunoValidos = ["CANDIDATO", "ATIVO", "ARQUIVADO"];

const id = z.coerce
  .number()
  .int("O ID deve ser um número inteiro.")
  .positive("O ID deve ser maior que zero.");

const nomeAluno = z
  .string({ error: "Informe o nome do aluno." })
  .trim()
  .min(1, "Informe o nome do aluno.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");

const statusAluno = z
  .string({ error: "Informe o status do aluno." })
  .trim()
  .toUpperCase()
  .pipe(
    z.enum(statusAlunoValidos, {
      error: "Status do aluno inválido. Opções: CANDIDATO, ATIVO ou ARQUIVADO.",
    }),
  );

export const listarAlunosSchema = z.object({
  query: z.object({
    nome: z.string().trim().optional().default(""),
    cidade: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.string().trim().optional(),
    ),
    cursoId: z.preprocess((v) => (v === "" ? undefined : v), id.optional()),
    status: z.preprocess(
      (v) => (v === "" ? undefined : v),
      statusAluno.optional(),
    ),
    pagina: z.coerce.number().int().positive().optional().default(1),
    limite: z.coerce.number().int().positive().optional().default(10),
  }),
});

export const atualizarAlunoSchema = z.object({
  params: z.object({
    id: id,
  }),
  body: z.object({
    nome: nomeAluno.optional(),
    status: statusAluno.optional(),
  }),
});

const candidatoImportacao = z.object({
  nome: nomeAluno,
  escolaridadePublica: z.boolean().default(false),
  cidade: z.string().trim().max(100).optional().nullable(),
  sexo: z.string().trim().max(20).optional().nullable(),
  classificacao: z.number().int().positive().optional().nullable(),
  periodo: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(periodosValidos, { error: "Informe um período válido." }))
    .optional()
    .nullable(),
  cursoId: id,
});

export const importarAlunosSchema = z.object({
  body: z.object({
    anoProcesso: z.coerce.number().int().positive("Informe um ano válido."),
    semestreProcesso: z.coerce
      .number()
      .int()
      .min(1)
      .max(2, "O semestre deve ser 1 ou 2."),
    candidatos: z
      .array(candidatoImportacao)
      .min(1, "A lista de candidatos não pode estar vazia."),
  }),
});
