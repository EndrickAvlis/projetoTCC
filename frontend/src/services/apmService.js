// Serviço da APM: carrega catálogo e registra venda ou finalização sem venda.
import { requisitarApi } from "./apiClient";

export const centavosParaReais = (centavos = 0) =>
  Math.round(Number(centavos)) / 100;

export const reaisParaCentavos = (reais = 0) =>
  Math.round(Number(reais) * 100);

const normalizarCatalogo = (resposta = {}) => ({
  uniformes: (resposta.uniformes ?? []).map((uniforme) => ({
    ...uniforme,
    preco: centavosParaReais(uniforme.precoCentavos),
  })),
  armario: {
    ...(resposta.armario ?? {}),
    permitido: Boolean(resposta.armario?.permitido),
    preco: centavosParaReais(resposta.armario?.precoCentavos),
    estoque: resposta.armario?.estoque ?? 0,
  },
});

export const carregarCatalogoVenda = async () =>
  normalizarCatalogo(await requisitarApi("/apm/catalogo-venda"));

export const registrarVenda = (atendimentoId, venda) =>
  requisitarApi(
    `/atendimentos/${encodeURIComponent(atendimentoId)}/vendas`,
    {
      method: "POST",
      body: JSON.stringify(venda),
    },
  );

export const finalizarSemVenda = (atendimentoId) =>
  requisitarApi(
    `/atendimentos/${encodeURIComponent(
      atendimentoId,
    )}/finalizacoes-sem-venda`,
    { method: "POST" },
  );
