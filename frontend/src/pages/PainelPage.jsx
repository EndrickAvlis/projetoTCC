// src/pages/PainelPrincipalPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FiVolume2, FiClock, FiTv } from "react-icons/fi";
import logoEtec from "../assets/logoEtec.png";
import Button from "../components/ui/Button.jsx";
import { formatarSenha } from "../utils/formatters.js";
import { tocarAlertaSonoro, falarChamada } from "../services/audioChamada.js";

const TEMPO_DESTAQUE_MS = 5000;

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

const formatarGuiche = (guiche) =>
  guiche ? String(guiche).padStart(2, "0") : "—";

const TEMAS_PAINEL = {
  triagem: {
    titulo: "TRIAGEM",
    fundo: "bg-triagem-dark",
    borda: "border-triagem-border/30",
    container: "bg-triagem/20",
    cardInterno: "bg-triagem-dark/80",
    destaque: "text-triagem-border",
    barra: "bg-triagem-border",
  },
  apm: {
    titulo: "APM",
    fundo: "bg-apm-dark",
    borda: "border-apm-border/30",
    container: "bg-apm/20",
    cardInterno: "bg-apm-dark/80",
    destaque: "text-apm-border",
    barra: "bg-apm-border",
  },
  docs: {
    titulo: "DOCUMENTOS",
    fundo: "bg-docs-dark",
    borda: "border-docs-border/30",
    container: "bg-docs/20",
    cardInterno: "bg-docs-dark/80",
    destaque: "text-docs-border",
    barra: "bg-docs-border",
  },
  padrao: {
    titulo: "GERAL",
    fundo: "bg-primary",
    borda: "border-admin-sidebar-divider",
    container: "bg-admin-sidebar-hover/30",
    cardInterno: "bg-admin-sidebar",
    destaque: "text-focus-ring",
    barra: "bg-focus-ring",
  },
};

const PainelPrincipalPage = () => {
  const { posto: postoParam } = useParams();
  const postoAtivo = postoParam?.toLowerCase();
  const tema = TEMAS_PAINEL[postoAtivo] ?? TEMAS_PAINEL.padrao;

  const [audioAtivo, setAudioAtivo] = useState(false);
  const [senhaDestaque, setSenhaDestaque] = useState(null);
  const [emDestaque, setEmDestaque] = useState(false);
  const [ultimasSenhas, setUltimasSenhas] = useState([]);
  const [horaAtual, setHoraAtual] = useState(() => new Date());

  const timerDestaqueRef = useRef(null);
  const audioAtivoRef = useRef(audioAtivo);

  useEffect(() => {
    audioAtivoRef.current = audioAtivo;
  }, [audioAtivo]);

  useEffect(() => {
    const intervaloRelogio = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(intervaloRelogio);
  }, []);

  const processarNovaChamada = useCallback(
    (dados) => {
      if (!dados?.codigo) return;

      if (postoAtivo && dados.posto?.toLowerCase() !== postoAtivo) {
        return;
      }

      const chamadaComId = {
        ...dados,
        idUnico: `${dados.codigo}-${Date.now()}`,
      };

      setSenhaDestaque(chamadaComId);
      setEmDestaque(true);

      if (audioAtivoRef.current) {
        tocarAlertaSonoro();
        falarChamada(dados.codigo, dados.posto, dados.guiche);
      }

      setUltimasSenhas((prevs) => {
        const semAtual = prevs.filter(
          (item) =>
            !(item.codigo === dados.codigo && item.posto === dados.posto),
        );
        return [chamadaComId, ...semAtual].slice(0, 5);
      });

      if (timerDestaqueRef.current) {
        clearTimeout(timerDestaqueRef.current);
      }

      timerDestaqueRef.current = setTimeout(() => {
        setEmDestaque(false);
      }, TEMPO_DESTAQUE_MS);
    },
    [postoAtivo],
  );

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/painel/stream`);

    eventSource.onmessage = (event) => {
      try {
        const dados = JSON.parse(event.data);
        processarNovaChamada(dados);
      } catch {
      }
    };

    return () => {
      eventSource.close();
      if (timerDestaqueRef.current) {
        clearTimeout(timerDestaqueRef.current);
      }
    };
  }, [processarNovaChamada]);

  const handleIniciarPainel = async () => {
    setAudioAtivo(true);
    tocarAlertaSonoro();

    try {
      if (
        !document.fullscreenElement &&
        document.documentElement.requestFullscreen
      ) {
        await document.documentElement.requestFullscreen();
      }
    } catch { }
  };

  return (
    <div
      className={`flex h-screen w-screen flex-col ${tema.fundo} font-sans text-text-inverse select-none overflow-hidden`}
    >
      {!audioAtivo && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-primary/95 px-4 text-text-inverse backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-surface/10 p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface/20 text-text-inverse">
              <FiTv size={32} />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">
              Painel de Chamadas
            </h1>
            <p className="mb-6 text-sm text-primary-text-muted">
              Clique para ativar o sinal sonoro, a voz e expandir em
              tela cheia.
            </p>
            <Button
              variant="success"
              size="lg"
              className="w-full py-4 text-base font-bold shadow-lg"
              leftIcon={<FiVolume2 size={20} />}
              onClick={handleIniciarPainel}
            >
              Iniciar Painel
            </Button>
          </div>
        </div>
      )}

      <header
        className={`flex h-20 items-center justify-between border-b ${tema.borda} ${tema.fundo} px-8 shadow-xs`}
      >
        <div className="flex items-center gap-6">
          <img
            src={logoEtec}
            alt="Logo Etec Philadelpho Gouvêa Netto"
            className="h-10 w-auto object-contain brightness-0 invert"
          />
          <div className={`h-8 w-px ${tema.borda}`} />
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-status-success" />
            </span>
            <span className="text-lg font-bold tracking-tight text-text-inverse">
              SIGA PHILA — {tema.titulo}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-2xl font-bold tracking-tight text-text-inverse">
              <FiClock size={20} className="text-admin-sidebar-text-muted" />
              {horaAtual.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-admin-sidebar-text-muted">
              {horaAtual.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 gap-6 overflow-hidden p-6">
        <section
          aria-live="polite"
          className={`relative flex flex-1 flex-col items-center justify-center rounded-2xl border ${tema.container} ${tema.borda} p-8 shadow-sm backdrop-blur-sm transition-all duration-300 ${emDestaque
            ? "border-focus-ring ring-4 ring-focus-ring/20 shadow-xl"
            : ""
            }`}
        >
          {senhaDestaque ? (
            <div className="flex flex-col items-center justify-center text-center">
              <span
                className={`mb-3 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-widest transition-colors ${emDestaque
                  ? `${tema.barra} text-text-inverse`
                  : `border ${tema.borda} ${tema.cardInterno} text-admin-sidebar-text-muted`
                  }`}
              >
                {emDestaque ? "Chamando Agora" : "Última Senha Chamada"}
              </span>

              <div
                className={`my-6 text-[10rem] font-black leading-none tracking-tighter transition-all duration-300 ${emDestaque
                  ? "scale-105 text-text-inverse drop-shadow-md"
                  : "text-admin-sidebar-text"
                  }`}
              >
                {formatarSenha(senhaDestaque.codigo)}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
                <div
                  className={`flex min-w-56 flex-col items-center rounded-xl border ${tema.borda} ${tema.cardInterno} px-8 py-5 shadow-inner`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-admin-sidebar-text-muted">
                    Posto
                  </span>
                  <span className="mt-1 text-3xl font-extrabold text-text-inverse">
                    {senhaDestaque.posto.toUpperCase()}
                  </span>
                </div>

                <div
                  className={`flex min-w-56 flex-col items-center rounded-xl border ${tema.borda} ${tema.cardInterno} px-8 py-5 shadow-inner`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-admin-sidebar-text-muted">
                    Guichê
                  </span>
                  <span
                    className={`mt-1 text-3xl font-extrabold ${tema.destaque}`}
                  >
                    {formatarGuiche(senhaDestaque.guiche)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-admin-sidebar-text-muted">
              <span className="text-2xl font-semibold">
                Aguardando senhas...
              </span>
            </div>
          )}

          {emDestaque && (
            <div
              className={`absolute bottom-0 left-0 h-2 ${tema.barra} transition-all duration-5000 ease-linear`}
              style={{
                width: emDestaque ? "0%" : "100%",
                transitionProperty: "width",
              }}
            />
          )}
        </section>

        <aside
          className={`flex w-96 flex-col rounded-2xl border ${tema.borda} ${tema.container} p-6 shadow-sm backdrop-blur-sm`}
        >
          <h2
            className={`border-b ${tema.borda} pb-4 text-base font-bold uppercase tracking-wider text-admin-sidebar-text-muted`}
          >
            Últimas Chamadas
          </h2>

          <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto">
            {ultimasSenhas.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-center text-sm text-admin-sidebar-text-muted">
                Nenhuma senha chamada ainda.
              </div>
            ) : (
              ultimasSenhas.map((item) => (
                <div
                  key={item.idUnico}
                  className={`flex items-center justify-between rounded-xl border ${tema.borda} ${tema.cardInterno} p-4 transition-colors`}
                >
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-text-inverse">
                      {formatarSenha(item.codigo)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-admin-sidebar-text">
                      {item.posto.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold uppercase text-admin-sidebar-text-muted">
                      Guichê
                    </span>
                    <span className={`text-xl font-bold ${tema.destaque}`}>
                      {formatarGuiche(item.guiche)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PainelPrincipalPage;
