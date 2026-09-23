import { requisitarApi } from "../../../services/apiClient";

const criarUrlProduto = (produtoId) =>
  `/admin/produtos/${encodeURIComponent(produtoId)}`;

const alterarStatusProduto = (produtoId, status) =>
  requisitarApi(`${criarUrlProduto(produtoId)}/status`, {
    method: "PATCH",
    body: status,
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
    body: {
      ...dados,
      tipo: "uniforme",
    },
  });

export const criarConfiguracaoArmario = (dados) =>
  requisitarApi("/admin/produtos", {
    method: "POST",
    body: {
      ...dados,
      nome: "Armário",
      tipo: "armario",
    },
  });

export const atualizarUniforme = (produtoId, dados) =>
  requisitarApi(criarUrlProduto(produtoId), {
    method: "PATCH",
    body: dados,
  });

export const alterarArquivamentoUniforme = (produtoId, arquivado) =>
  alterarStatusProduto(produtoId, arquivado ? "arquivado" : "ativo");

export const alterarEstoqueUniforme = (produtoId, alteracao) =>
  requisitarApi(`${criarUrlProduto(produtoId)}/alterarEstoque`, {
    method: "PATCH",
    body: alteracao,
  });

export const buscarConfiguracaoArmario = () =>
  requisitarApi("/admin/produtos/armario");

export const atualizarConfiguracaoArmario = (produtoId, dados) =>
  requisitarApi(criarUrlProduto(produtoId), {
    method: "PATCH",
    body: dados,
  });

export const alterarDisponibilidadeArmario = (produtoId, disponivel) =>
  alterarStatusProduto(produtoId, disponivel ? "disponivel" : "indisponivel");
