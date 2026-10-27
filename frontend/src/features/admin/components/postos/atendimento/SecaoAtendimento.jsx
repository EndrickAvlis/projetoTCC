import * as React from "react";
import Select from "../../../../../components/ui/Select";
import Input from "../../../../../components/ui/Input";
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

  const { cursos } = useCursos();
  const { cards, finalizadasPorHora, cursosAtivos } = useAtendimento({
    tipoPeriodo,
    dataInicio: tipoPeriodo === "personalizado" ? dataInicio : undefined,
    dataFim: tipoPeriodo === "personalizado" ? dataFim : undefined,
    cursoId: cursoId ? Number(cursoId) : undefined,
    periodoCurso: periodoCurso || undefined,
  });

  const handleTipoPeriodoChange = (e) => {
    setTipoPeriodo(e.target.value);
  };

  const rotuloPeriodoAtual =
    tipoPeriodo === "personalizado" && dataInicio && dataFim
      ? `${dataInicio} a ${dataFim}`
      : OPCOES_TIPO_PERIODO.find((o) => o.value === tipoPeriodo)?.label;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <div className="flex-1 min-w-56">
          <Select
            size="md"
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            options={cursos.map((c) => ({ value: c.id, label: c.nome }))}
            placeholder="Todos os cursos"
          />
        </div>

        <div className="w-56">
          <Select
            size="md"
            value={periodoCurso}
            onChange={(e) => setPeriodoCurso(e.target.value)}
            options={PERIODOS_CURSO}
            placeholder="Todos os períodos"
          />
        </div>

        <div className="w-56">
          <Select
            size="md"
            value={tipoPeriodo}
            onChange={handleTipoPeriodoChange}
            options={OPCOES_TIPO_PERIODO}
            placeholder={null}
          />
        </div>

        {tipoPeriodo === "personalizado" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              size="md"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              ariaLabel="Data inicial"
            />
            <span className="text-sm text-text-secondary">até</span>
            <Input
              type="date"
              size="md"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              ariaLabel="Data final"
            />
          </div>
        )}
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
