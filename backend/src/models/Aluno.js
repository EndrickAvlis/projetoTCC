export default class Aluno {
    constructor({
        cpf = null,
        ano = null,
        nome = null,
        id = null
    } = {}){
        this.cpf = cpf;
        this.ano = ano;
        this.nome = nome;
        this.id = id;
    }
}