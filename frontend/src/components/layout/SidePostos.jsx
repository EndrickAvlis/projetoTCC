// Barra lateral de apresentação: alterna visualmente entre fila e histórico sem fazer chamadas à API.
import { useState } from "react";
import Button from "../ui/Button";
import FilaGrid from "../Fila/FilaGrid";
import HistoricoGrid from "../Fila/HistoricoGrid";
import SenhaAtualCard from "../Fila/SenhaAtualCard";

const SidePostos = ({ pessoasEsperando, senhasAguardando, senhasChamadasHoje = [], senhaAtual, onSelecionarSenha, onAlternarPrioridade, carregando }) => {
  // Controla apenas qual conteúdo visual está selecionado na lateral.
  const [visualizacao, setVisualizacao] = useState("aguardando");
  const exibindoHistorico = visualizacao === "historico";

  return (
    <aside className="flex h-screen w-80 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex flex-col items-center justify-center gap-1 border-b border-border bg-page p-4">
        <p className="text-[0.9rem] font-medium uppercase tracking-wide text-text-secondary">Senhas aguardando</p>
        <p className="text-3xl font-bold text-primary">{pessoasEsperando}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-border p-3">
        <Button variant={exibindoHistorico ? "secondary" : "primary"} size="sm" onClick={() => setVisualizacao("aguardando")}>
          Aguardando
        </Button>
        <Button variant={exibindoHistorico ? "primary" : "secondary"} size="sm" onClick={() => setVisualizacao("historico")}>
          Chamadas hoje
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!exibindoHistorico && (
          <SenhaAtualCard
            senha={senhaAtual}
            onAlternarPrioridade={onAlternarPrioridade}
            desabilitada={carregando}
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
            onSelecionarSenha={onSelecionarSenha}
            desabilitada={carregando || Boolean(senhaAtual)}
          />
        )}

      </div>
    </aside>
  );
};

export default SidePostos;
