export default class Curso {
    constructor({
        id = null,
        periodo = null,
        nome = null
    } = {}){
        this.id = id;
        this.periodo = periodo;
        this.nome = nome;
    }
}