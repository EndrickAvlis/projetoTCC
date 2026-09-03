import ProdutoService from "../services/ProdutoService.js";

const produtoService = new ProdutoService();

const mapearProdutosResposta = (produto) => ({
  id: produto.idProduto,
  nome: produto.nomeProduto,
  preco: Number(produto.precoProduto),
  quantidade: produto.quantidadeProduto,
  tipo: produto.tipoProduto,
  status: produto.statusItem,
});

export const criarProdutoAdmin = async (req, res) => {
  const produto = await produtoService.criarProduto(req.validado.body);

  return res.status(201).json({
    produto: mapearProdutosResposta(produto),
  });
};

export const listarProdutosAdmin = async (req, res) => {
  const produtos = await produtoService.listarProdutos(req.validado.query);

  return res.json({
    produtos: produtos.map(mapearProdutosResposta),
    total: produtos.length,
  });
};

export const atualizarProdutosAdmin = async (req, res) => {
  const { produtoId } = req.validado.params;
  const produto = await produtoService.atualizarProduto(
    produtoId,
    req.validado.body,
  );

  return res.json({
    produto: mapearProdutosResposta(produto),
  });
};

export const alterarStatusProdutoAdmin = async (req, res) => {
  const { produtoId } = req.validado.params;
  const { status } = req.validado.body;

  const produto = await produtoService.alterarStatusProduto(
    produtoId,
    status,
  );

  return res.json({
    produto: mapearProdutosResposta(produto),
  });
};

export const alterarEstoqueProdutoAdmin = async (req, res) => {
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

export const buscarConfiguracaoArmario = async (req, res) => {
  const produto = await produtoService.buscarConfiguracaoArmario();

  return res.json({
    produto: mapearProdutosResposta(produto),
  });
};