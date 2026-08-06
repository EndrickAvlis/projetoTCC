export default class Produto {
    constructor({
        id = null,
        nome = null,
        preco = null,
        quantidade = null,
        tipo = null,
        status = null
    } = {}){
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
        this.tipo = tipo;
        this.status = status;
    }
}