import { z } from "zod";
import { formatarNome } from "../utils/formatarNome.js";

const periodosValidos = ["manha", "tarde", "noite", "integral", "online"];
const VAGAS_MAXIMAS = 9999;

const nomeCurso = z
  .string({ error: "Informe o nome do curso." })
  .transform(formatarNome)
  .pipe(
    z
      .string()
      .min(1, "Informe o nome do curso.")
      .max(100, "O nome deve ter no máximo 100 caracteres."),
  );

const periodo = z
  .string({ error: "Informe um período válido." })
  .transform((valor) => valor.trim().toLowerCase())
  .pipe(z.enum(periodosValidos, { error: "Informe um período válido." }));

const vagasTotais = z.preprocess(
  (valor) =>
    typeof valor === "string" && valor.trim() !== "" ? Number(valor) : valor,
  z
    .number({ error: "Informe uma quantidade de vagas válida." })
    .int("Informe um número inteiro maior que zero.")
    .min(1, "Informe ao menos 1 vaga.")
    .max(VAGAS_MAXIMAS, "A quantidade máxima permitida é 9.999 vagas."),
);

const matriculaAtiva = z.boolean({
  error: "Informe verdadeiro ou falso para a matrícula.",
});

const dadosPeriodo = z.object({
  periodo: periodo,
  vagasTotais: vagasTotais,
  matriculaAtiva,
});

const periodosCurso = z.array(dadosPeriodo).superRefine((periodos, contexto) => {
    const indicesPorPeriodo = new Map();

    periodos.forEach((periodo, indice) => {
      if (indicesPorPeriodo.has(periodo.periodo)) {
        contexto.addIssue({
          code: "custom",
          path: [indice, "periodo"],
          message: "Este período já foi informado para o curso.",
        });
      }

      indicesPorPeriodo.set(periodo.periodo, indice);
    });
  });

const id = z.coerce.number().int("O ID deve ser um número inteiro.").positive("O ID deve ser maior que zero.");

export const listarCursosSchema = z.object({
  query: z.object({
    busca: z
      .string()
      .trim()
      .max(100, "A busca deve ter no máximo 100 caracteres")
      .optional()
      .default(""),
    arquivado: z
      .enum(["true", "false", "todos"], {
        error: "O filtro arquivado deve ser true, false ou todos.",
      })
      .optional()
      .transform((valor) => {
        if (valor === undefined) return undefined;
        if (valor === "todos") return null;
        return valor === "true";
      }),
  }),
});

export const criarCursoSchema = z.object({
  body: z.object({
    nome: nomeCurso,
    periodos: periodosCurso.min(1, "É necessário ao menos um período"),
  }),
});

export const atualizarCursoSchema = z.object({
  params: z.object({ cursoId: id }),
  body: z
    .object({
      nome: nomeCurso.optional(),
      arquivado: z
        .boolean({
          error: "Informe verdadeiro ou falso para o arquivamento.",
        })
        .optional(),
    })
    .refine((dados) => Object.values(dados).some((v) => v !== undefined), {
      message: "Informe ao menos um campo para atualização.",
    }),
});

export const excluirCursoSchema = z.object({
  params: z.object({ cursoId: id }),
});

export const criarPeriodoSchema = z.object({
  params: z.object({ cursoId: id }),
  body: dadosPeriodo,
});

export const atualizarPeriodoSchema = z.object({
  params: z.object({
    cursoId: id,
    periodoId: id,
  }),
  body: z
    .object({
      vagasTotais: vagasTotais.optional(),
      matriculaAtiva: matriculaAtiva.optional(),
    })
    .refine((dados) => Object.values(dados).some((v) => v !== undefined), {
      message: "Informe ao menos um campo para atualização.",
    }),
});

export const excluirPeriodoSchema = z.object({
  params: z.object({
    cursoId: id,
    periodoId: id,
  }),
});

