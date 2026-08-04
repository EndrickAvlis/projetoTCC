class Contribuicao {
    constructor({
        id = null,
        valor = null,
        data = null,
        codCompra = null
    } = {}){
        this.id = id;
        this.valor = valor;
        this.data = data;
        this.codCompra = codCompra;
    }
}