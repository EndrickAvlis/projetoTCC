export default class Voluntario {
    constructor({
        id = null,
        nome = null,
        senha = null,
        tipo = null,
        status = null
    } = {}){
        this.id = id,
        this.nome = nome,
        this.senha = senha,
        this.tipo = tipo,
        this.status = status
    }
}