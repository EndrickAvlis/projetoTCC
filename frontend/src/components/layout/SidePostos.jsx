// Barra lateral compartilhada que alterna entre a fila disponível e o histórico diário do posto.
import { useState } from "react";
import Button from "../ui/Button";
import ListLine from "../common/ListFila";

const SidePostos = ({ pessoasEsperando, senhasAguardando, senhasChamadasHoje, senhaAtual, onSelecionarSenha, onAlternarPrioridade, carregando }) => {
  // Mantém a visualização ativa sem sair da tela de atendimento.
  const [visualizacao, setVisualizacao] = useState("aguardando");
  const exibindoHistorico = visualizacao === "historico";
  const senhasExibidas = exibindoHistorico ? senhasChamadasHoje : senhasAguardando;

  return (
    <aside className="w-80 h-screen shrink-0 bg-white border-r border-border flex flex-col">
      <div className="p-4 border-b border-border bg-background flex flex-col items-center justify-center gap-1">
        <p className="text-[0.9rem] text-gray-500 font-medium tracking-wide uppercase">Senhas Aguardando</p>
        <p className="text-3xl font-bold text-primary">{pessoasEsperando}</p>
      </div>

      <div className="p-3 border-b border-border grid grid-cols-2 gap-2">
        <Button variant={exibindoHistorico ? "secondary" : "primary"} size="sm" onClick={() => setVisualizacao("aguardando")}>
          Aguardando
        </Button>
        <Button variant={exibindoHistorico ? "primary" : "secondary"} size="sm" onClick={() => setVisualizacao("historico")}>
          Chamadas hoje
        </Button>
      </div>

      <div className="px-4 pt-4">
        <h2 className="uppercase text-[0.9rem] font-semibold text-gray-400 tracking-wider">
          {exibindoHistorico ? "Chamadas hoje" : "Aguardando atendimento"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ListLine
          senhas={senhasExibidas}
          senhaAtual={exibindoHistorico ? null : senhaAtual}
          historico={exibindoHistorico}
          onSelecionarSenha={onSelecionarSenha}
          onAlternarPrioridade={onAlternarPrioridade}
          desabilitada={carregando || Boolean(senhaAtual)}
          prioridadeDesabilitada={carregando}
        />
      </div>
    </aside>
  );
};

export default SidePostos;
