import { requisitarApi } from "../../../services/apiClient";

const criarUrlProduto = (produtoId) =>
  `/admin/produtos/${encodeURIComponent(produtoId)}`;

const alterarStatusProduto = (produtoId, status) =>
  requisitarApi(`${criarUrlProduto(produtoId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const listarUniformesAdmin = ({
  busca = "",
  arquivado = false,
} = {}) => {
  const params = new URLSearchParams({
    tipo: "uniforme",
    arquivado: String(arquivado),
  });

  const buscaLimpa = busca.trim();

  if (buscaLimpa) {
    params.set("busca", buscaLimpa);
  }

  return requisitarApi(`/admin/produtos?${params.toString()}`);
};

export const criarUniforme = (dados) =>
  requisitarApi("/admin/produtos", {
    method: "POST",
    body: JSON.stringify({
      ...dados,
      tipo: "uniforme",
    }),
  });

export const criarConfiguracaoArmario = (dados) =>
  requisitarApi("/admin/produtos", {
    method: "POST",
    body: JSON.stringify({
      ...dados,
      nome: "Armário",
      tipo: "armario",
    }),
  });

export const atualizarUniforme = (produtoId, dados) =>
  requisitarApi(criarUrlProduto(produtoId), {
    method: "PATCH",
    body: JSON.stringify(dados),
  });

export const alterarArquivamentoUniforme = (produtoId, arquivado) =>
  alterarStatusProduto(produtoId, arquivado ? "arquivado" : "ativo");

export const alterarEstoqueUniforme = (produtoId, alteracao) =>
  requisitarApi(`${criarUrlProduto(produtoId)}/alterarEstoque`, {
    method: "PATCH",
    body: JSON.stringify(alteracao),
  });

export const buscarConfiguracaoArmario = () =>
  Promise.resolve({
    produto: {
      id: 20,
      nome: "Armário",
      preco: 120,
      quantidade: 18,
      tipo: "armario",
      status: "disponivel",
    },
  });
//export const buscarConfiguracaoArmario = () =>
//requisitarApi("/admin/produtos/armario");

export const atualizarConfiguracaoArmario = (produtoId, dados) =>
  requisitarApi(criarUrlProduto(produtoId), {
    method: "PATCH",
    body: JSON.stringify(dados),
  });

export const alterarDisponibilidadeArmario = (produtoId, disponivel) =>
  alterarStatusProduto(produtoId, disponivel ? "disponivel" : "indisponivel");
