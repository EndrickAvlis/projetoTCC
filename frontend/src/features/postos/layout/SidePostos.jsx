import { useState } from "react";
import Button from "../../../components/ui/Button";
import FilaGrid from "../components/fila/FilaGrid";
import HistoricoGrid from "../components/fila/HistoricoGrid";
import SenhaAtualCard from "../components/fila/SenhaAtualCard";
import { useAtendimento } from "../context/atendimentoContext";
import { useFila } from "../hooks/useFila";

const SidePostos = ({ etapa }) => {
  const [visualizacao, setVisualizacao] = useState("aguardando");
  const exibindoHistorico = visualizacao === "historico";

  const {
    senhaAtual,
    chamarSenha,
    alterarPrioridade,
    carregando,
  } = useAtendimento();

  const {
    senhasAguardando,
    senhasChamadasHoje,
    carregandoFila,
    carregarFila,
  } = useFila(etapa);

  const handleSelecionarSenha = async (senhaSelecionada) => {
    await chamarSenha(senhaSelecionada.id, etapa);
    await carregarFila({ silencioso: true });
  };

  const ocupado = carregando || carregandoFila;

  return (
    <aside className="flex h-screen w-75 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex flex-col items-center justify-center gap-1 border-b border-border bg-page p-4">
        <p className="text-[0.9rem] font-medium uppercase tracking-wide text-text-secondary">
          Senhas aguardando
        </p>
        <p className="text-3xl font-bold text-primary">
          {senhasAguardando.length}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-border p-3">
        <Button
          variant={exibindoHistorico ? "secondary" : "primary"}
          size="sm"
          onClick={() => setVisualizacao("aguardando")}
        >
          Aguardando
        </Button>
        <Button
          variant={exibindoHistorico ? "primary" : "secondary"}
          size="sm"
          onClick={() => setVisualizacao("historico")}
        >
          Chamadas hoje
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!exibindoHistorico && (
          <SenhaAtualCard
            senha={senhaAtual}
            onAlternarPrioridade={alterarPrioridade}
            desabilitada={ocupado}
          />
        )}

        <h2 className="mb-3 mt-4 text-[0.9rem] font-semibold uppercase tracking-wider text-text-secondary">
          {exibindoHistorico ? "Chamadas hoje" : "Aguardando atendimento"}
        </h2>

        {exibindoHistorico ? (
          <HistoricoGrid senhas={senhasChamadasHoje} />
        ) : (
          <FilaGrid
            senhas={senhasAguardando}
            onSelecionarSenha={handleSelecionarSenha}
            desabilitada={ocupado || Boolean(senhaAtual)}
          />
        )}
      </div>
    </aside>
  );
};

export default SidePostos;