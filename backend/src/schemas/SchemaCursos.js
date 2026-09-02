import { z } from "zod";

const periodosValidos = ["manha", "tarde", "noite", "integral"];
const palavrasMinusculas = new Set([
  "a",
  "as",
  "o",
  "os",
  "de",
  "da",
  "das",
  "do",
  "dos",
  "e",
  "em",
  "na",
  "nas",
  "no",
  "nos",
  "para",
  "por",
]);

const nome = (nome) =>
  nome
    .trim()
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .map((palavra, indice) => {
      if (indice > 0 && palavrasMinusculas.has(palavra)) return palavra;
      return palavra.charAt(0).toLocaleUpperCase("pt-BR") + palavra.slice(1);
    })
    .join(" ");

const nomeCurso = z.string({ error: "Informe o nome do curso." }).transform(nome).pipe(
    z
      .string()
      .min(1, "Informe o nome do curso.")
      .max(100, "O nome deve ter no máximo 100 caracteres."),
  );

const periodo = z.string({ error: "Informe um período válido." }).transform((periodo) => periodo.trim().toLowerCase()).pipe(z.enum(periodosValidos, { error: "Informe um período válido." }));

const vagasTotais = z.preprocess(
  (valor) =>
    typeof valor === "string" && valor.trim() !== "" ? Number(valor) : valor,
  z
    .number({ error: "Informe uma quantidade de vagas válida." })
    .int("Informe um número inteiro maior ou igual a zero.")
    .nonnegative("Informe um número inteiro maior ou igual a zero."),
);

const dadosPeriodo = z.object({
  periodo: periodo,
  vagasTotais: vagasTotais,
  matriculaAtiva: z.boolean({
    error: "Informe verdadeiro ou falso para a matrícula.",
  }),
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
    busca: z.string().trim().optional().default(""),
arquivado: z
  .enum(["true", "false"], {
    error: "O filtro arquivado deve ser true ou false.",
  })
  .optional()
  .transform((valor) =>
    valor === undefined ? undefined : valor === "true",
  ),
  }),
});

export const criarCursoSchema = z.object({
  body: z.object({
    nome: nomeCurso,
    periodos: periodosCurso.min(1, "É necessário ao menos um período"),
  }),
});

export const atualizarNomeCursoSchema = z.object({
  params: z.object({ cursoId: id }),
  body: z.object({ nome: nomeCurso }),
});

export const alterarArquivamentoCursoSchema = z.object({
  params: z.object({ cursoId: id }),
  body: z.object({
    arquivado: z.boolean({
      error: "Informe verdadeiro ou falso para o arquivamento.",
    }),
  }),
});

export const criarPeriodoCursoSchema = z.object({
  params: z.object({ cursoId: id }),
  body: dadosPeriodo,
});

export const atualizarPeriodoCursoSchema = z.object({
  params: z.object({
    cursoId: id,
    periodoId: id,
  }),
  body: dadosPeriodo,
});
