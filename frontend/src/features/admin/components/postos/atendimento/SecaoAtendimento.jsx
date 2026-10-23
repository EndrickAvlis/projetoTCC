import * as React from "react";
import Select from "../../../../../components/ui/Select";
import Input from "../../../../../components/ui/Input";
import Button from "../../../../../components/ui/Button";
import Card from "../../../../../components/ui/Card";
import { useAtendimento } from "../../../hooks/postos/useAtendimento";
import { useCursos } from "../../../hooks/useCursos";
import GraficoFinalizadasHora from "./GraficoFinalizadasHora";
import CursosAtivos from "./CursosAtivos";

import { PERIODOS_CURSO } from "../../../../../constants/cursoOptions";
import { OPCOES_TIPO_PERIODO } from "../../../constants/postos";

const CONFIG_CARDS = [
  {
    id: "finalizadas",
    titulo: "Senhas finalizadas",
    subtitulo: "Concluíram todo o fluxo",
    bordaLateral: "success",
    chave: "senhasFinalizadas",
  },
  {
    id: "canceladas",
    titulo: "Senhas canceladas",
    subtitulo: "Encerradas pelo administrador",
    bordaLateral: "danger",
    chave: "senhasCanceladas",
  },
  {
    id: "emitidas",
    titulo: "Senhas emitidas",
    subtitulo: "Total emitidas",
    bordaLateral: "primary",
    chave: "senhasEmitidas",
  },
  {
    id: "tma",
    titulo: "Tempo médio de atendimento",
    subtitulo: "Média por atendimento",
    bordaLateral: "info",
    chave: "tma",
    sufixo: " min",
  },
];

const SecaoAtendimento = () => {
  const [cursoId, setCursoId] = React.useState("");
  const [periodoCurso, setPeriodoCurso] = React.useState("");
  const [tipoPeriodo, setTipoPeriodo] = React.useState("hoje");
  const [dataInicio, setDataInicio] = React.useState("");
  const [dataFim, setDataFim] = React.useState("");

  const [popoverAberto, setPopoverAberto] = React.useState(false);
  const popoverRef = React.useRef(null);

  const { cursos } = useCursos();
  const { cards, finalizadasPorHora, cursosAtivos } = useAtendimento({
    tipoPeriodo,
    dataInicio: tipoPeriodo === "personalizado" ? dataInicio : undefined,
    dataFim: tipoPeriodo === "personalizado" ? dataFim : undefined,
    cursoId: cursoId ? Number(cursoId) : undefined,
    periodoCurso: periodoCurso || undefined,
  });

  React.useEffect(() => {
    const fecharAoClicarFora = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverAberto(false);
      }
    };

    if (popoverAberto) {
      document.addEventListener("mousedown", fecharAoClicarFora);
    }
    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
    };
  }, [popoverAberto]);

  const handleTipoPeriodoChange = (e) => {
    const valor = e.target.value;
    setTipoPeriodo(valor);
    if (valor === "personalizado") {
      setPopoverAberto(true);
    } else {
      setPopoverAberto(false);
    }
  };

  const rotuloPeriodoAtual =
    tipoPeriodo === "personalizado" && dataInicio && dataFim
      ? `${dataInicio} a ${dataFim}`
      : OPCOES_TIPO_PERIODO.find((o) => o.value === tipoPeriodo)?.label;

  const opcoesPeriodo = OPCOES_TIPO_PERIODO.map((op) =>
    op.value === "personalizado" && dataInicio && dataFim
      ? { ...op, label: `${dataInicio} até ${dataFim}` }
      : op
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4 items-start border-b border-border pb-4">
        <div className="col-span-2">
          <Select
            size="md"
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            options={cursos.map((c) => ({ value: c.id, label: c.nome }))}
            placeholder="Todos os cursos"
          />
        </div>

        <div className="col-span-1">
          <Select
            size="md"
            value={periodoCurso}
            onChange={(e) => setPeriodoCurso(e.target.value)}
            options={PERIODOS_CURSO}
            placeholder="Todos os períodos"
          />
        </div>

        <div className="col-span-1 relative">
          <Select
            size="md"
            value={tipoPeriodo}
            onChange={handleTipoPeriodoChange}
            options={opcoesPeriodo}
            placeholder={null}
          />

          {popoverAberto && (
            <div
              ref={popoverRef}
              className="absolute right-0 top-full mt-2 z-30 w-72 p-4 bg-surface rounded-xl border border-border shadow-xl space-y-3"
            >
              <h5 className="text-xs font-semibold text-text-primary">
                Intervalo personalizado
              </h5>

              <div className="space-y-2">
                <Input
                  type="date"
                  label="Data Inicial"
                  size="sm"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
                <Input
                  type="date"
                  label="Data Final"
                  size="sm"
                  value={dataFim}
                  onChange={(e) => {
                    setDataFim(e.target.value);
                    if (e.target.value) setPopoverAberto(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {CONFIG_CARDS.map((item) => {
          const valor = cards[item.chave];
          const valorFormatado = item.sufixo ? `${valor}${item.sufixo}` : valor;

          return (
            <Card
              key={item.id}
              bordaLateral={item.bordaLateral}
              className="w-full"
            >
              <span className="text-xs font-semibold text-text-secondary">
                {item.titulo}
              </span>
              <div className="text-3xl font-bold text-text-primary mt-2 tabular-nums">
                {valorFormatado}
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {item.subtitulo}
              </p>
            </Card>
          );
        })}
      </div>

      <GraficoFinalizadasHora
        dados={finalizadasPorHora}
        periodoRotulo={rotuloPeriodoAtual}
      />

      <CursosAtivos cursos={cursosAtivos} />
    </div>
  );
};

export default SecaoAtendimento;
