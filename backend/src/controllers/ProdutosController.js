import ProdutoService from "../services/ProdutoService.js";

const produtoService = new ProdutoService();

const mapearProdutoResposta = (produto) => ({
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
        produto: mapearProdutoResposta(produto),
    })
}
