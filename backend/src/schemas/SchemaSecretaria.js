import { z } from "zod";

export const listarPendenciasSchema = z.object({
  query: z.object({
    busca: z.string().trim().optional(),
    cursoId: z.coerce.number().int().positive().optional(),
    pagina: z.coerce.number().int().positive().default(1),
    limite: z.coerce.number().int().positive().max(50).default(8),
  }),
});

export const registrarRetiradaSchema = z.object({
  params: z.object({
    compraId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    itens: z
      .array(
        z.object({
          produtoId: z.coerce.number().int().positive(),
          quantidade: z.coerce.number().int().positive(),
        }),
      )
      .min(1, "Informe ao menos um item para retirada.")
      .refine(
        (itens) =>
          new Set(itens.map((item) => item.produtoId)).size === itens.length,
        { message: "Não é permitido repetir o mesmo produto na retirada." },
      ),
  }),
});
