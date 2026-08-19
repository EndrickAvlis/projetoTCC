import { z } from "zod";

const tiposProdutoValidos = ["uniforme", "armario"];

const id = z.coerce
  .number()
  .int("O ID deve ser um número inteiro.")
  .positive("O ID deve ser maior que zero.");

const nomeProduto = z
  .string({ invalid_type_error: "Informe o nome do produto." })
  .trim()
  .min(1, "Informe o nome do produto.")
  .max(50, "O nome deve ter no máximo 50 caracteres.");

const preco = z.coerce
  .number({ invalid_type_error: "Informe um preço válido." })
  .positive("O preço deve ser maior que zero.");

const quantidade = z.coerce
  .number({ invalid_type_error: "Informe uma quantidade válida." })
  .int("A quantidade deve ser um número inteiro.")
  .nonnegative("A quantidade não pode ser negativa.");

const tipoProduto = z
  .string({ invalid_type_error: "Informe o tipo do produto." })
  .trim()
  .toLowerCase()
  .pipe(
    z.enum(tiposProdutoValidos, {
      message: "O tipo deve ser uniforme ou armario.",
    })
  );

const dadosProduto = z.object({
  nome: nomeProduto,
  preco,
  quantidade,
  tipo: tipoProduto,
});

export const produtoIdSchema = z.object({
  params: z.object({
    produtoId: id,
  }),
});

export const criarProdutoSchema = z.object({
  body: dadosProduto,
});

export const atualizarProdutoSchema = z.object({
  params: z.object({
    produtoId: id,
  }),
  body: dadosProduto,
});

export const listarProdutoSchema = z.object({
  query: z.object({
    busca: z.string().trim().optional().default(""),
    tipo: z
      .enum(tiposProdutoValidos, {
        message: "O tipo precisa ser uniforme ou armario",
      })
      .default("uniforme"),
    arquivado: z
      .enum(["true", "false"], {
        message: "O filtro arquivado deve ser true ou false",
      })
      .optional(),
  }),
});