import ProdutoService from "../services/produtoService.js";

const produtoService = new ProdutoService();

const mapearProdutosResposta = (produto) => ({
  id: produto.idProduto,
  nome: produto.nomeProduto,
  preco: Number(produto.precoProduto),
  quantidade: produto.quantidadeProduto,
  tipo: produto.tipoProduto,
  status: produto.statusProduto,
});

export const listarProdutos = async (req, res) => {
  const produtos = await produtoService.listar(req.validado.query);

  return res.json({
    produtos: produtos.map(mapearProdutosResposta),
    total: produtos.length,
  });
};

export const criarProduto = async (req, res) => {
  const produto = await produtoService.criar(req.validado.body);

  return res.status(201).json({
    produto: mapearProdutosResposta(produto),
  });
};

export const atualizarProduto = async (req, res) => {
  const { produtoId } = req.validado.params;
  const produto = await produtoService.atualizar(
    produtoId,
    req.validado.body,
  );

  return res.json({
    produto: mapearProdutosResposta(produto),
  });
};

export const atualizarEstoque = async (req, res) => {
  const { produtoId } = req.validado.params;
  const { operacao, quantidade } = req.validado.body;

  const produto = await produtoService.alterarEstoque(
    produtoId,
    operacao,
    quantidade,
  );

  return res.json({
    produto: mapearProdutosResposta(produto),
  });
};

export const excluirProduto = async (req, res) => {
  const { produtoId } = req.validado.params;
  const produto = await produtoService.excluir(produtoId);

  return res.json({
    produto: mapearProdutosResposta(produto),
  });
};