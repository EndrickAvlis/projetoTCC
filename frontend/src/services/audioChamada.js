import { formatarSenha } from "../utils/formatters.js";

const ATRASO_VOZ_MS = 650;
const TIMEOUT_VOZ_MS = 8000;

const POSTOS_FALADOS = {
  triagem: "Triagem",
  apm: "á,p,m",
  docs: "Documentos",
};

let audio = null;
const filaChamadas = [];
let falando = false;
let timerFala = null;
let timerBackup = null;

const obterAudioContext = () => {
  if (!audio && window.AudioContext) {
    audio = new window.AudioContext();
  }
  if (audio?.state === "suspended") audio.resume();
  return audio;
};

export const tocarAlertaSonoro = () => {
  const ctx = obterAudioContext();
  if (!ctx) return;

  const tocarTom = (frequencia, inicio, duracao) => {
    const oscilador = ctx.createOscillator();
    const ganho = ctx.createGain();

    oscilador.type = "sine";
    oscilador.frequency.setValueAtTime(frequencia, ctx.currentTime + inicio);

    ganho.gain.setValueAtTime(0.18, ctx.currentTime + inicio);
    ganho.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + inicio + duracao,
    );

    oscilador.connect(ganho);
    ganho.connect(ctx.destination);

    oscilador.start(ctx.currentTime + inicio);
    oscilador.stop(ctx.currentTime + inicio + duracao);
  };

  tocarTom(587.33, 0, 0.25);
  tocarTom(880.0, 0.2, 0.4);
};

const formatarSenhaParaFala = (codigo) => {
  const codigoFormatado = formatarSenha(codigo);
  if (!codigoFormatado) return String(codigo ?? "").trim();

  const prefixo = codigoFormatado[0] === "A" ? "Á" : codigoFormatado[0];
  const digitos = codigoFormatado.slice(1);
  const zeros = digitos.match(/^0+/)?.[0].length ?? 0;
  const numero = Number(digitos);

  if (zeros === 2) return `${prefixo}-zero-zero ${numero}`;
  if (zeros === 1) return `${prefixo}-zero ${numero}`;
  return `${prefixo} ${numero}`;
};

const montarTextoChamada = ({ codigo, posto, guiche, prioritaria }) => {
  const prefixo = prioritaria ? "Senha prioritária" : "Senha";
  const nomePosto = POSTOS_FALADOS[posto?.toLowerCase()] ?? posto ?? "";
  const guicheLimpo = String(guiche ?? "").trim();

  return [
    `${prefixo}, ${formatarSenhaParaFala(codigo)}`,
    nomePosto,
    guicheLimpo ? `Guichê ${guicheLimpo}` : "",
  ]
    .filter(Boolean)
    .join(". ");
};

const tocarProxima = () => {
  if (falando || filaChamadas.length === 0) return;

  falando = true;
  const chamada = filaChamadas.shift();
  tocarAlertaSonoro();

  timerFala = setTimeout(() => {
    timerFala = null;

    if (!window.speechSynthesis) {
      falando = false;
      tocarProxima();
      return;
    }

    const locucao = new SpeechSynthesisUtterance(montarTextoChamada(chamada));
    locucao.lang = "pt-BR";
    locucao.rate = 0.95;

    const finalizar = () => {
      clearTimeout(timerBackup);
      timerBackup = null;
      if (!falando) return;
      falando = false;
      tocarProxima();
    };

    locucao.onend = finalizar;
    locucao.onerror = finalizar;
    timerBackup = setTimeout(finalizar, TIMEOUT_VOZ_MS);

    window.speechSynthesis.speak(locucao);
  }, ATRASO_VOZ_MS);
};

export const enfileirarChamadaSonora = (dados) => {
  if (!dados?.codigo) return;
  filaChamadas.push(dados);
  tocarProxima();
};

export const limparFilaAudio = () => {
  filaChamadas.length = 0;
  clearTimeout(timerFala);
  clearTimeout(timerBackup);
  timerFala = null;
  timerBackup = null;
  falando = false;
  window.speechSynthesis?.cancel();
};
