class ItemCompra {
    constructor({
        codProduto = null,
        codCompra = null,
        precoUnitario = null,
        quantidadeItem = null,
        quantidadeRetiradaItem = null,
        status = null
    } = {}){
        this.codProduto = codProduto;
        this.codCompra = codCompra;
        this.precoUnitario = precoUnitario;
        this.quantidadeItem = quantidadeItem;
        this.quantidadeRetiradaItem = quantidadeRetiradaItem;
        this.status = status;
    }
}