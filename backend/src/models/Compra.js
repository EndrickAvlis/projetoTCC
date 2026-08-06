export default class Compra {
    constructor({
        id = null,
        valor = null,
        data = null,
        codigoRetirada = null,

        codAluno = null,
        codVoluntario = null
    } = {}){
        this.id = id;
        this.valor = valor;
        this.data = data;
        this.codigoRetirada = codigoRetirada;
        this.codAluno = codAluno;
        this.codVoluntario = codVoluntario;
    }
}