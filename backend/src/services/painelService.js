import { EventEmitter } from "node:events";

class PainelService extends EventEmitter {
  mostrarSenhaChamada(dados) {
    this.emit("chamada", dados);
  }
}

export const painelService = new PainelService();