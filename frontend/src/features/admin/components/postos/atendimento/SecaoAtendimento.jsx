import * as React from "react";
import Alert from "../../../../../components/ui/Alert";
import Card from "../../../../../components/ui/Card";
import FiltroPeriodo from "../../../../../components/ui/FiltroPeriodo";
import { obterRotuloPeriodo } from "../../../../../constants/periodoOptions";
import { useAtendimento } from "../../../hooks/postos/useAtendimento";
import GraficoFinalizadasHora from "./GraficoFinalizadasHora";
import CursosAtivos from "./CursosAtivos";

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
  const [tipoPeriodo, setTipoPeriodo] = React.useState("HOJE");
  const [dataInicio, setDataInicio] = React.useState("");
  const [dataFim, setDataFim] = React.useState("");

  const { cards, finalizadasPorHora, cursosAtivos, erro } = useAtendimento({
    tipoPeriodo,
    dataInicio: tipoPeriodo === "PERSONALIZADO" ? dataInicio : undefined,
    dataFim: tipoPeriodo === "PERSONALIZADO" ? dataFim : undefined,
  });

  const rotuloPeriodoAtual = obterRotuloPeriodo({
    periodo: tipoPeriodo,
    dataInicio,
    dataFim,
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <FiltroPeriodo
          incluirTodo={false}
          periodo={tipoPeriodo}
          dataInicio={dataInicio}
          dataFim={dataFim}
          onPeriodoChange={setTipoPeriodo}
          onDataInicioChange={setDataInicio}
          onDataFimChange={setDataFim}
          ariaLabel="Período do atendimento"
        />
      </div>

      {erro && <Alert type="error" message={erro} />}

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
