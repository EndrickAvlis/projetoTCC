import { z } from "zod";

const tiposProdutoValidos = ["uniforme", "armario"];

const converterNumero = (valor) =>
  typeof valor === "string" && valor.trim() !== "" ? Number(valor) : valor;

const id = z.coerce
  .number()
  .int("O ID deve ser um número inteiro.")
  .positive("O ID deve ser maior que zero.");

const nomeProduto = z
  .string({ error: "Informe o nome do produto." })
  .trim()
  .min(1, "Informe o nome do produto.")
  .max(50, "O nome deve ter no máximo 50 caracteres.");

const preco = z.preprocess(
  converterNumero,
  z
    .number({ error: "Informe um preço válido." })
    .positive("O preço deve ser maior que zero.")
    .max(999.99, "O preço máximo permitido é R$ 999,99."),
);

const quantidade = z.preprocess(
  converterNumero,
  z
    .number({ error: "Informe uma quantidade válida." })
    .int("A quantidade deve ser um número inteiro.")
    .nonnegative("A quantidade não pode ser negativa.")
    .max(99999, "A quantidade máxima permitida é 99.999."),
);

const status = z.boolean({
  error: "Informe verdadeiro ou falso para o status.",
});

const tipoProduto = z
  .string({ error: "Informe o tipo do produto." })
  .trim()
  .toLowerCase()
  .pipe(
    z.enum(tiposProdutoValidos, {
      error: "O tipo deve ser uniforme ou armario.",
    }),
  );

export const criarProdutoSchema = z.object({
  body: z
    .object({
      nome: nomeProduto.optional(),
      preco,
      quantidade,
      tipo: tipoProduto,
      status: status.optional().default(true),
    })
    .refine((dados) => dados.tipo === "armario" || Boolean(dados.nome), {
      message: "Informe o nome do produto.",
      path: ["nome"],
    }),
});

export const atualizarProdutoSchema = z.object({
  params: z.object({
    produtoId: id,
  }),
  body: z
    .object({
      nome: nomeProduto.optional(),
      preco: preco.optional(),
      quantidade: quantidade.optional(),
      status: status.optional(),
    })
    .refine(
      (dados) => Object.values(dados).some((valor) => valor !== undefined),
      { message: "Informe ao menos um campo para atualizar." },
    ),
});

export const alterarEstoqueSchema = z.object({
  params: z.object({
    produtoId: id,
  }),
  body: z
    .object({
      operacao: z.enum(["adicionar", "diminuir", "corrigir"], {
        error: "A operação deve ser adicionar, diminuir ou corrigir.",
      }),
      quantidade,
    })
    .refine(
      (dados) => dados.operacao === "corrigir" || dados.quantidade > 0,
      {
        message: "Informe uma quantidade maior que 0.",
        path: ["quantidade"],
      },
    ),
});

export const listarProdutosSchema = z.object({
  query: z.object({
    busca: z
      .string()
      .trim()
      .max(100, "A busca deve ter no máximo 100 caracteres.")
      .optional(),
    tipo: tipoProduto.optional(),
    status: z
      .enum(["true", "false"], {
        error: "O filtro de status deve ser true ou false.",
      })
      .transform((v) => v === "true")
      .optional(),
  }),
});