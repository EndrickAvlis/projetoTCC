let audio = null;

const obterAudioContext = () => {
  if (typeof window === "undefined") return null;

  if (!audio) {
    const AudioContextClass = window.AudioContext;
    if (AudioContextClass) {
      audio = new AudioContextClass();
    }
  }
  if (audio && audio.state === "suspended") audio.resume();
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

export const falarChamada = (codigo, posto, guiche) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const num = Number(codigo);
  let letra = "Á";
  if (num < 10) {
    letra = "Á-zero-zero";
  } else if (num < 100) {
    letra = "Á-zero";
  }

  const senha = `${letra} ${num}`;
  const texto = `Senha, ${senha}. ${posto === "apm" ? "á,p,m" : posto}. Guichê: ${guiche}`;

  const locucao = new SpeechSynthesisUtterance(texto);
  locucao.lang = "pt-BR";
  locucao.rate = 0.95;

  setTimeout(() => {
    window.speechSynthesis.speak(locucao);
  }, 650);
};
