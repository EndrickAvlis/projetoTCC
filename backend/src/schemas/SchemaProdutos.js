import { z } from "zod";

const tiposProdutoValidos = ["uniforme", "armario"];

const id = z.coerce
  .number()
  .int("O ID deve ser um número inteiro.")
  .positive("O ID deve ser maior que zero.");

const nomeProduto = z
  .string({ error: "Informe o nome do produto." })
  .trim()
  .min(1, "Informe o nome do produto.")
  .max(50, "O nome deve ter no máximo 50 caracteres.");

const preco = z.coerce
  .number({ error: "Informe um preço válido." })
  .positive("O preço deve ser maior que zero.");

const quantidade = z.coerce
  .number({ error: "Informe uma quantidade válida." })
  .int("A quantidade deve ser um número inteiro.")
  .nonnegative("A quantidade não pode ser negativa.");

const tipoProduto = z
  .string({ error: "Informe o tipo do produto." })
  .trim()
  .toLowerCase()
  .pipe(
    z.enum(tiposProdutoValidos, {
      error: "O tipo deve ser uniforme ou armario.",
    }),
  );

export const produtoIdSchema = z.object({
  params: z.object({
    produtoId: id,
  }),
});

export const criarProdutoSchema = z.object({
  body: z.object({
    nome: nomeProduto,
    preco,
    quantidade,
    tipo: tipoProduto,
    status: z.boolean().optional().default(true),
  }),
});

export const atualizarProdutoSchema = z.object({
  params: z.object({
    produtoId: id,
  }),
  body: z.object({
    nome: nomeProduto.optional(),
    preco: preco.optional(),
    quantidade: quantidade.optional(),
    status: z.boolean().optional(),
  }),
});

export const alterarEstoqueSchema = z.object({
  params: z.object({
    produtoId: id,
  }),
  body: z.object({
    operacao: z.enum(["adicionar", "diminuir", "corrigir"], {
      error: "A operação deve ser adicionar, diminuir ou corrigir.",
    }),
    quantidade,
  }),
});

export const listarProdutosSchema = z.object({
  query: z.object({
    busca: z.string().trim().optional(),
    tipo: z.enum(["uniforme", "armario"]).optional(),
    status: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  }),
});