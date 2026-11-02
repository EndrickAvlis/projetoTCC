import { z } from "zod";

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data no formato YYYY-MM-DD.").refine((valor) => {
  const [ano, mes, dia] = valor.split("-").map(Number);
  const dataValida = new Date(Date.UTC(ano, mes - 1, dia));
  return dataValida.getUTCFullYear() === ano && dataValida.getUTCMonth() === mes - 1 && dataValida.getUTCDate() === dia;
}, "Informe uma data válida.");

const id = z.coerce.number().int().positive();
const opcional = (schema) => z.union([schema, z.literal("")]).optional().transform((valor) => valor === "" ? undefined : valor);

const filtros = z.object({
  periodo: z.enum(["HOJE", "SEMANA", "MES", "PERSONALIZADO"]).default("HOJE"),
  dataInicio: opcional(data),
  dataFim: opcional(data),
  cursoId: opcional(id),
  formaPagamento: opcional(z.enum(["dinheiro", "pix", "debito", "credito"])),
  tipoReceita: opcional(z.enum(["uniforme", "armario", "contribuicao"])),
  atendenteId: opcional(id),
}).superRefine((query, contexto) => {
  if (query.periodo !== "PERSONALIZADO") return;
  if (!query.dataInicio || !query.dataFim) {
    contexto.addIssue({ code: "custom", path: ["dataInicio"], message: "Informe as datas inicial e final." });
  } else if (query.dataInicio > query.dataFim) {
    contexto.addIssue({ code: "custom", path: ["dataFim"], message: "A data inicial deve ser anterior ou igual à data final." });
  }
});

export const obterDadosRelatorioSchema = z.object({
  query: z.object({
    periodo: z.enum(["HOJE", "SEMANA", "MES", "PERSONALIZADO"]).default("HOJE"),
    dataInicio: opcional(data),
    dataFim: opcional(data),
    cursoId: opcional(id),
    formaPagamento: opcional(z.enum(["dinheiro", "pix", "debito", "credito"])),
    tipoReceita: opcional(z.enum(["uniforme", "armario", "contribuicao"])),
    atendenteId: opcional(id),
    pagina: z.coerce.number().int().positive().default(1),
    limite: z.coerce.number().int().positive().max(100).default(10),
  }).superRefine((query, contexto) => {
    if (query.periodo !== "PERSONALIZADO") return;
    if (!query.dataInicio || !query.dataFim) {
      contexto.addIssue({ code: "custom", path: ["dataInicio"], message: "Informe as datas inicial e final." });
    } else if (query.dataInicio > query.dataFim) {
      contexto.addIssue({ code: "custom", path: ["dataFim"], message: "A data inicial deve ser anterior ou igual à data final." });
    }
  }),
});
export const exportarRelatorioSchema = z.object({ query: filtros });
export const detalheRelatorioSchema = z.object({ params: z.object({ id }) });
