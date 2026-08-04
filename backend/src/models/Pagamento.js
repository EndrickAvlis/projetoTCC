export default class Pagamento {
    constructor({
        id = null,
        valor = null,
        tipo = null,
        codCompra = null,
    } = {}){
        this.id = id;
        this.valor = valor;
        this.tipo = tipo;
        this.codCompra = codCompra;
    }
}