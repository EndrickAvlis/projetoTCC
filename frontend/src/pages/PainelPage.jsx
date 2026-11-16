import { useState, useEffect, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { FiVolume2, FiClock, FiTv } from "react-icons/fi";
import logoEtec from "../assets/logoEtec.png";
import Button from "../components/ui/Button.jsx";
import { formatarSenha } from "../utils/formatters.js";
import { API_URL } from "../services/apiClient.js";
import {
  POSTOS_PAINEL,
  ROTULOS_POSTO,
  TEMAS_PAINEL,
} from "../constants/paineis.js";
import {
  tocarAlertaSonoro,
  enfileirarChamadaSonora,
  limparFilaAudio,
} from "../services/audioChamada.js";

const TEMPO_DESTAQUE_MS = 7000;
const FUSO_HORARIO = "America/Sao_Paulo";

const formatarGuiche = (guiche) => {
  const valor = String(guiche ?? "").trim();
  if (!valor) return "—";
  return /^\d+$/.test(valor) ? valor.padStart(2, "0") : valor.toUpperCase();
};

const formatarPosto = (posto) => {
  if (!posto) return "—";
  return ROTULOS_POSTO[posto.toLowerCase()] ?? posto.toUpperCase();
};

const lerEventoJson = (event) => {
  try {
    return JSON.parse(event.data);
  } catch {
    return null;
  }
};

const PainelConteudo = ({ postoValido }) => {
  const tema = TEMAS_PAINEL[postoValido] ?? TEMAS_PAINEL.padrao;

  const [audioLiberado, setAudioLiberado] = useState(false);
  const [conectado, setConectado] = useState(false);
  const [senhaDestaque, setSenhaDestaque] = useState(null);
  const [emDestaque, setEmDestaque] = useState(false);
  const [ultimasSenhas, setUltimasSenhas] = useState([]);
  const [horaAtual, setHoraAtual] = useState(() => new Date());

  const audioLiberadoRef = useRef(false);
  const timerDestaqueRef = useRef(null);

  const chamadasAnteriores = ultimasSenhas
    .filter((item) => item.id !== senhaDestaque?.id)
    .slice(0, 5);

  useEffect(() => {
    const intervalo = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const query = postoValido
      ? `?posto=${encodeURIComponent(postoValido)}`
      : "";
    const eventSource = new EventSource(`${API_URL}/painel/stream${query}`);

    eventSource.onopen = () => setConectado(true);
    eventSource.onerror = () => setConectado(false);

    eventSource.addEventListener("estado_inicial", (event) => {
      const dados = lerEventoJson(event);
      const lista = Array.isArray(dados?.chamadas) ? dados.chamadas : [];
      setUltimasSenhas(lista);
      setSenhaDestaque(lista[0] ?? null);
      setEmDestaque(false);
    });

    eventSource.addEventListener("chamada", (event) => {
      const dados = lerEventoJson(event);
      if (!dados?.codigo) return;

      const chamada = {
        ...dados,
        id: dados.id ?? `${dados.codigo}-${Date.now()}`,
      };

      setSenhaDestaque(chamada);
      setEmDestaque(true);

      if (audioLiberadoRef.current) {
        enfileirarChamadaSonora(chamada);
      }

      setUltimasSenhas((prevs) => {
        const semAtual = prevs.filter(
          (item) =>
            !(item.codigo === chamada.codigo && item.posto === chamada.posto),
        );
        return [chamada, ...semAtual].slice(0, 6);
      });

      clearTimeout(timerDestaqueRef.current);
      timerDestaqueRef.current = setTimeout(() => {
        setEmDestaque(false);
      }, TEMPO_DESTAQUE_MS);
    });

    eventSource.addEventListener("reset", () => {
      clearTimeout(timerDestaqueRef.current);
      limparFilaAudio();
      setSenhaDestaque(null);
      setEmDestaque(false);
      setUltimasSenhas([]);
    });

    return () => {
      eventSource.close();
      limparFilaAudio();
      clearTimeout(timerDestaqueRef.current);
    };
  }, [postoValido]);

  const handleIniciarPainel = () => {
    audioLiberadoRef.current = true;
    setAudioLiberado(true);
    tocarAlertaSonoro();
  };

  return (
    <div
      className={`flex min-h-screen w-full flex-col lg:h-screen lg:overflow-hidden ${tema.fundo} font-sans text-text-inverse select-none`}
    >
      {!audioLiberado && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${tema.fundo} px-4 text-text-inverse`}
        >
          <div
            className={`w-full max-w-md rounded-2xl border ${tema.borda} ${tema.container} p-8 text-center shadow-2xl backdrop-blur-md`}
          >
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${tema.borda} ${tema.cardInterno} text-text-inverse`}
            >
              <FiTv size={32} />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">
              Painel de Chamadas — {tema.titulo}
            </h1>
            <p className="mb-6 text-sm text-text-inverse/75">
              Clique para liberar o sinal sonoro e a chamada por voz.
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
        className={`flex min-h-20 flex-wrap items-center justify-between gap-4 border-b ${tema.borda} ${tema.fundo} px-4 py-3 shadow-xs sm:px-8`}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          <img
            src={logoEtec}
            alt="Logo Etec Philadelpho Gouvêa Netto"
            className="h-9 w-auto object-contain brightness-0 invert sm:h-10"
          />
          <div className="h-8 w-px bg-surface/25" aria-hidden="true" />
          <div className="flex items-center gap-3">
            <span
              className="relative flex h-3 w-3 shrink-0"
              title={conectado ? "Conectado ao painel" : "Reconectando"}
            >
              {conectado && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-75" />
              )}
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  conectado ? "bg-status-success" : "bg-status-warning"
                }`}
              />
            </span>
            <span className="text-base font-bold tracking-tight text-text-inverse sm:text-lg">
              SIGA PHILA — {tema.titulo}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-xl font-bold tracking-tight tabular-nums text-text-inverse sm:text-2xl">
            <FiClock size={20} className="text-text-inverse/75" />
            {horaAtual.toLocaleTimeString("pt-BR", {
              timeZone: FUSO_HORARIO,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="text-xs font-medium uppercase tracking-wider text-text-inverse/75">
            {horaAtual.toLocaleDateString("pt-BR", {
              timeZone: FUSO_HORARIO,
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:overflow-hidden">
        <section
          aria-live="polite"
          className={`flex flex-1 flex-col items-center justify-center rounded-2xl border ${tema.container} ${tema.borda} p-6 shadow-sm backdrop-blur-sm transition-all duration-300 sm:p-8 ${
            emDestaque ? `${tema.destaqueCard} shadow-xl` : ""
          }`}
        >
          {senhaDestaque ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2.5">
                <span
                  className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-widest transition-colors ${
                    emDestaque
                      ? tema.pillDestaque
                      : `border ${tema.borda} ${tema.cardInterno} text-text-inverse/80`
                  }`}
                >
                  {emDestaque ? "Chamando Agora" : "Última Senha Chamada"}
                </span>

                {senhaDestaque.prioritaria && (
                  <span className="inline-flex items-center rounded-full bg-status-warning-bg px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-pendencias-dark">
                    Prioritária
                  </span>
                )}
              </div>

              <div
                className={`my-4 text-[clamp(5.5rem,13vw,11rem)] font-black leading-none tracking-tighter tabular-nums transition-all duration-300 sm:my-6 ${
                  emDestaque
                    ? "scale-105 text-text-inverse drop-shadow-md"
                    : "text-text-inverse/90"
                }`}
              >
                {formatarSenha(senhaDestaque.codigo)}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                <div
                  className={`flex min-w-44 flex-col items-center rounded-xl border ${tema.borda} ${tema.cardInterno} px-6 py-4 shadow-inner sm:min-w-56 sm:px-8 sm:py-5`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-inverse/75">
                    Posto
                  </span>
                  <span className="mt-1 text-2xl font-extrabold text-text-inverse sm:text-3xl">
                    {formatarPosto(senhaDestaque.posto)}
                  </span>
                </div>

                <div
                  className={`flex min-w-44 flex-col items-center rounded-xl border ${tema.borda} ${tema.cardInterno} px-6 py-4 shadow-inner sm:min-w-56 sm:px-8 sm:py-5`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-inverse/75">
                    Guichê
                  </span>
                  <span
                    className={`mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl ${tema.destaque}`}
                  >
                    {formatarGuiche(senhaDestaque.guiche)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-text-inverse/75">
              <span className="text-xl font-semibold sm:text-2xl">
                Aguardando senhas...
              </span>
            </div>
          )}
        </section>

        <aside
          className={`flex w-full shrink-0 flex-col rounded-2xl border ${tema.borda} ${tema.container} p-5 shadow-sm backdrop-blur-sm sm:p-6 lg:w-88 xl:w-104`}
        >
          <h2
            className={`border-b ${tema.borda} pb-4 text-base font-bold uppercase tracking-wider text-text-inverse/75`}
          >
            Últimas Chamadas
          </h2>

          <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto">
            {chamadasAnteriores.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-8 text-center text-sm text-text-inverse/70">
                {senhaDestaque
                  ? "Nenhuma chamada anterior."
                  : "Nenhuma senha chamada ainda."}
              </div>
            ) : (
              chamadasAnteriores.map((item) => (
                <div
                  key={item.id}
                  className={`grid items-center gap-3 rounded-xl border ${tema.borda} ${tema.cardInterno} p-4 ${
                    postoValido
                      ? "grid-cols-[1fr_auto]"
                      : "grid-cols-[auto_1fr_auto]"
                  }`}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-2xl font-black tabular-nums text-text-inverse">
                      {formatarSenha(item.codigo)}
                    </span>
                    {item.prioritaria && (
                      <span className="rounded-full bg-status-warning-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pendencias-dark">
                        Prioritária
                      </span>
                    )}
                  </div>

                  {!postoValido && (
                    <div className="text-center">
                      <span className="text-base font-bold text-text-inverse/85 xl:text-lg">
                        {formatarPosto(item.posto)}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold uppercase text-text-inverse/70">
                      Guichê
                    </span>
                    <span
                      className={`text-xl font-bold tabular-nums ${tema.destaque}`}
                    >
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

const PainelPage = () => {
  const { posto: postoParam } = useParams();
  const postoNormalizado = postoParam?.toLowerCase();

  if (postoParam && !POSTOS_PAINEL.includes(postoNormalizado)) {
    return <Navigate to="/painel" replace />;
  }

  const postoValido = postoNormalizado || null;

  return <PainelConteudo key={postoValido ?? "geral"} postoValido={postoValido} />;
};

export default PainelPage;
