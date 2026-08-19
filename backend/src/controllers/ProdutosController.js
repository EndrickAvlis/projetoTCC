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
    })
}

export const listarProdutosAdmin = async( req, res)=>{
    const produtos = await produtoService.listarProdutos(req.validado.query);

    return res.json({
        produtos: produtos.map(mapearProdutosResposta),
        total: produtos.length,
    })
}
