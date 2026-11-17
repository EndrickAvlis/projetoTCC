import { EventEmitter } from "node:events";
import pg from "pg";
import "dotenv/config";
import { prisma } from "../config/prisma.js";

const CANAL = "chamada";
const LIMITE_HISTORICO = 20;
export const POSTOS_PAINEL = new Set(["triagem", "apm", "docs"]);

const hojeLocal = () =>
  new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

class PainelService extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0);
    this.historico = [];
    this.diaAtual = hojeLocal();
    this.conectado = false;
    this.seq = 0;
    this.startEvent();
  }

  #verificarDia() {
    const hoje = hojeLocal();
    if (hoje !== this.diaAtual) {
      this.diaAtual = hoje;
      this.historico = [];
    }
  }

  #registrarChamada(dados) {
    this.#verificarDia();
    if (!dados?.codigo) return null;

    if (dados.id && this.historico.some((item) => item.id === dados.id)) {
      return dados;
    }

    const chamada = {
      id: dados.id ?? `${Date.now()}-${++this.seq}`,
      codigo: dados.codigo,
      posto: dados.posto ? String(dados.posto).toLowerCase() : null,
      guiche: dados.guiche ?? null,
      prioritaria: Boolean(dados.prioritaria),
    };

    this.historico = [
      chamada,
      ...this.historico.filter(
        (item) =>
          !(item.codigo === chamada.codigo && item.posto === chamada.posto),
      ),
    ].slice(0, LIMITE_HISTORICO);

    return chamada;
  }

  async #publicar(evento, payload, dadosLocais) {
    if (!this.conectado) {
      this.emit(evento, dadosLocais);
      return;
    }

    try {
      await prisma.$executeRaw`SELECT pg_notify(${CANAL}, ${JSON.stringify(payload)})`;
    } catch {
      this.emit(evento, dadosLocais);
    }
  }

  obterHistorico(posto = null, limite = 6) {
    this.#verificarDia();
    const lista =
      posto && POSTOS_PAINEL.has(posto)
        ? this.historico.filter((item) => item.posto === posto)
        : this.historico;

    return lista.slice(0, limite);
  }

  async startEvent() {
    if (this.reconectando) return;

    const reconectar = async () => {
      if (this.reconectando) return;
      this.reconectando = true;
      this.conectado = false;
      await this.pgClient?.end().catch(() => {});

      setTimeout(() => {
        this.reconectando = false;
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
      this.conectado = true;

      this.pgClient.on("notification", (mensagem) => {
        if (mensagem.channel !== CANAL || !mensagem.payload) return;

        try {
          const dados = JSON.parse(mensagem.payload);
          if (dados?.tipo === "reset") {
            this.diaAtual = hojeLocal();
            this.historico = [];
            this.emit("reset");
            return;
          }

          const chamada = this.#registrarChamada(dados);
          if (chamada) this.emit("chamada", chamada);
        } catch {
          return;
        }
      });
    } catch {
      reconectar();
    }
  }

  async mostrarSenhaChamada(dados) {
    const chamada = this.#registrarChamada(dados);
    if (!chamada) return;

    await this.#publicar("chamada", { tipo: "chamada", ...chamada }, chamada);
  }

  async limparPainel() {
    this.diaAtual = hojeLocal();
    this.historico = [];
    await this.#publicar("reset", { tipo: "reset" });
  }
}

export const painelService = new PainelService();
