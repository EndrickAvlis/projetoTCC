import { z } from "zod";
import { formatarNome } from "../utils/formatarNome.js";

const id = z.coerce.number().int().positive();
const etapa = z.enum(["triagem", "apm", "docs"]);
const documentosValidos = [
  "RG_CIN",
  "CPF_CIN",
  "FOTO",
  "ESCOLARIDADE_PUBLICA",
  "HISTORICO_ENSINO_FUNDAMENTAL",
];

export const vincularAlunoSchema = z.object({
  params: z.object({ senhaId: id }),
  body: z.object({
    alunoId: id.nullish(),
    dadosAluno: z.object({
      nome: z
        .string()
        .transform(formatarNome)
        .pipe(z.string().min(1, "Informe o nome").max(100)),
      cidade: z
        .string()
        .transform(formatarNome)
        .pipe(z.string().min(1, "Informe a cidade").max(100)),
      sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO"], {
        errorMap: () => ({ message: "Selecione o sexo" }),
      }),
      escolaridadePublica: z.boolean(),
    }),
    matricula: z.object({
      cursoId: id,
      classificacao: z
        .number()
        .int()
        .positive("Classificação deve ser maior que 0"),
      periodo: z.enum(["manha", "tarde", "noite", "integral", "online"]),
      anoEscolar: z.number().int().positive(),
    }),
  }),
});

export const registrarPendenciasSchema = z.object({
  body: z.object({
    atendimentoId: id,
    documentos: z.array(z.enum(documentosValidos)).min(1),
  }),
});

export const listarPendenciasSchema = z.object({
  query: z.object({ etapa: etapa.default("triagem") }),
});

export const retomarAtendimentoSchema = z.object({
  body: z.object({ senhaId: id, etapa }),
});

export const senhaAtendimentoSchema = z.object({
  body: z.object({ senhaId: id }),
});

export const rechamarAtendimentoSchema = z.object({
  body: z.object({ senhaId: id, etapa }),
});

export const recuperarAtendimentoSchema = z.object({
  params: z.object({ etapa }),
});
