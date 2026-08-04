class Aluno {
    constructor({
        cpf = null,
        ano = null,
        nome = null
    } = {}){
        this.cpf = cpf;
        this.ano = ano;
        this.nome = nome;
    }
}