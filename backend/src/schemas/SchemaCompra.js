import { z } from "zod";

const itemSchema = z
  .object({
    produtoId: z.coerce.number().int().positive(),
    quantidade: z.coerce.number().int().positive(),
    quantidadeRetirada: z.coerce.number().int().nonnegative(),
    precoUnitario: z.coerce.number().positive(),
  })
  .refine((item) => item.quantidadeRetirada <= item.quantidade, {
    message: "A quantidade retirada não pode ser maior que a quantidade comprada.",
  });

const itensSchema = z
  .array(itemSchema)
  .default([])
  .refine(
    (itens) => new Set(itens.map((item) => item.produtoId)).size === itens.length,
    { message: "Não é permitido repetir o mesmo produto nos itens da compra." },
  );

const formaPagamentoSchema = z.object({
  tipo: z.enum(["pix", "dinheiro", "debito", "credito"]),
  valor: z.coerce.number().positive(),
});

const pagamentosSchema = z
  .array(formaPagamentoSchema)
  .min(1, "Informe ao menos uma forma de pagamento.");

export const compraSchema = z.object({
  body: z.object({
    codAluno: z.coerce.number().int().positive(),
    itens: itensSchema,
    valorContribuicao: z.coerce.number().nonnegative().optional().default(0),
    pagamentos: pagamentosSchema,
    valorTotal: z.coerce.number().positive(),
  }),
});
