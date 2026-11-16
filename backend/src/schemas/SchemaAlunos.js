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

const anoProcesso = z.coerce
  .number()
  .int("Informe um ano válido.")
  .min(2000, "Informe um ano válido.")
  .max(2100, "Informe um ano válido.");

const semestreProcesso = z.coerce
  .number()
  .int("Informe um semestre válido.")
  .min(1, "O semestre deve ser 1 ou 2.")
  .max(2, "O semestre deve ser 1 ou 2.");

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
    ignorarArquivados: z.preprocess(
      (v) => (v === "true" ? true : v === "false" ? false : v),
      z.boolean().optional().default(false),
    ),
    pagina: z.coerce.number().int().positive().optional().default(1),
    limite: z.coerce.number().int().positive().optional().default(10),
  }),
});

export const listarCidadesSchema = z.object({
  query: z.object({
    status: z.preprocess(
      (v) => (v === "" ? undefined : v),
      statusAluno.optional(),
    ),
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

export const arquivarCandidatosSchema = z.object({
  body: z
    .object({
      anoProcesso: anoProcesso.optional(),
      semestreProcesso: semestreProcesso.optional(),
    })
    .refine(
      (body) => (body.anoProcesso == null) === (body.semestreProcesso == null),
      {
        message:
          "Informe o ano e o semestre juntos para filtrar por processo seletivo.",
      },
    ),
});

export const excluirAlunoSchema = z.object({
  params: z.object({
    id: id,
  }),
});

const candidatoImportacao = z.object({
  nome: nomeAluno,
  escolaridadePublica: z.boolean().default(false),
  cidade: z.string().trim().max(100).optional().nullable(),
  sexo: z.string().trim().max(20).optional().nullable(),
  classificacao: z.number().int().positive().optional().nullable(),
  periodo: z
    .string({ error: "Informe um período válido." })
    .trim()
    .toLowerCase()
    .pipe(z.enum(periodosValidos, { error: "Informe um período válido." })),
  cursoId: id,
});

export const importarAlunosSchema = z.object({
  body: z.object({
    anoProcesso,
    semestreProcesso,
    candidatos: z
      .array(candidatoImportacao)
      .min(1, "A lista de candidatos não pode estar vazia."),
  }),
});
