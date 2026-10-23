import { z } from "zod";

const id = z.coerce.number().int().positive();
const etapa = z.enum(["triagem", "apm", "docs"]);
const documentosValidos = [
  "RG_CIN", "CPF_CIN", "FOTO", "ESCOLARIDADE_PUBLICA",
  "HISTORICO_ENSINO_FUNDAMENTAL",
];

export const vincularAlunoSchema = z.object({
  params: z.object({ senhaId: id }),
  body: z.object({
    alunoId: id.nullish(),
    dadosAluno: z.object({
      nome: z.string().trim().min(1).max(100),
      cidade: z.string().trim().max(100).nullish(),
      sexo: z.string().trim().max(20).nullish(),
      escolaridadePublica: z.boolean(),
    }),
    matricula: z.object({
      cursoId: id,
      classificacao: z.number().int().positive().nullish(),
      periodo: z.enum(["manha", "tarde", "noite", "integral", "online"]),
      anoEscolar: z.number().int().positive().nullish(),
    }),
  }),
});

export const registrarPendenciasSchema = z.object({
  params: z.object({ atendimentoId: id }),
  body: z.object({
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
