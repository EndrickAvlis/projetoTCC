class Senha {   
    constructor({
        id = null,
        codigo = null,
        etapaAtual = null,
        status = null,
        emitidaEm = null,
        chamadaEm = null,
        tipo = null,
        codAluno = null
    } = {}) {
        this.id = id;
        this.codigo = codigo;
        this.etapaAtual = etapaAtual;
        this.status = status;
        this.emitidaEm = emitidaEm;
        this.chamadaEm = chamadaEm;
        this.tipo = tipo;
        this.idAluno = idAluno;
    }
}