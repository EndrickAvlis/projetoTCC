import { z } from "zod";

const itemSchema = z.object({
        produtoId: z
            .coerce
            .number()
            .int()
            .positive(),
        quantidade: z
            .coerce
            .number()
            .int()
            .positive(),
        quantidadeRetirada: z
            .coerce
            .number()
            .int()
            .positive(),
        precoUnitario: z
            .coerce
            .number()
            .positive(),
});

const itensSchema = z.array(itemSchema);

const formaPagamentoSchema = z.object({
    tipo: z
        .enum(["pix", "dinheiro", "cartão"])
        .default(["dinheiro"]),
    valor: z
        .coerce
        .number()
        .positive()
});

const pagamentosSchema = z.array(formaPagamentoSchema);

export const compraSchema = z.object({
    body: z.object({
        codAluno: z
            .coerce
            .number()
            .int()
            .positive(),
        itens: itensSchema,
        valorContribuicao: z
            .coerce
            .number()
            .positive(),
        pagamentos: pagamentosSchema,
        valorContribuicao: z
            .coerce
            .number()
            .positive(),
        valorTotal: z
            .coerce
            .number()
            .positive(),
    })
});