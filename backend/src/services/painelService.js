import { EventEmitter } from "node:events";
import pg from "pg";
import "dotenv/config";
import { prisma } from "../config/prisma.js";

const CANAL = "chamada";

class PainelService extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0);
    this.startEvent();
  }

  async startEvent() {
    if (this.isReconnecting) return;

    const reconectar = async () => {
      if (this.isReconnecting) return;
      this.isReconnecting = true;

      try {
        await this.pgClient?.end();
      } catch {}

      setTimeout(() => {
        this.isReconnecting = false;
        this.startEvent();
      }, 5000);
    };

    try {
      this.pgClient = new pg.Client({
        connectionString: process.env.DATABASE_URL?.replace("-pooler.", "."),
      });

      this.pgClient.on("error", reconectar);
      this.pgClient.on("end", reconectar);

      await this.pgClient.connect();
      await this.pgClient.query(`LISTEN ${CANAL}`);

      this.pgClient.on("notification", (mensagem) => {
        if (mensagem.channel === CANAL && mensagem.payload) {
          try {
            const dados = JSON.parse(mensagem.payload);
            this.emit("chamada", dados);
          } catch {}
        }
      });
    } catch {
      reconectar();
    }
  }

  async mostrarSenhaChamada(dados) {
    try {
      await prisma.$executeRaw`SELECT pg_notify(${CANAL}, ${JSON.stringify(dados)})`;
    } catch {
      this.emit("chamada", dados);
    }
  }
}

export const painelService = new PainelService();
