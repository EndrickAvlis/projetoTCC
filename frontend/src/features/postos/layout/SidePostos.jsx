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

  const { senhaAtual, chamarSenha, alterarPrioridade, carregando } =
    useAtendimento();

  const { senhasAguardando, senhasChamadasHoje, carregandoFila, carregarFila } =
    useFila(etapa);

  const handleChamarSenha = async (senha) => {
    await chamarSenha(senha.id, etapa);
    await carregarFila({ silencioso: true });
  };

  const handleAlternarPrioridade = async () => {
    try {
      await alterarPrioridade();
    } catch {}
  };

  const ocupado = carregando || carregandoFila;
  const proximaSenha = senhasAguardando[0];
  const podeChamar = !ocupado && !senhaAtual && Boolean(proximaSenha);

  const handleChamarProximo = () => {
    if (proximaSenha) {
      handleChamarSenha(proximaSenha);
    }
  };

  return (
    <aside className="flex h-screen w-75 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex flex-col items-center justify-center gap-1 border-b border-border bg-page p-4">
        <p className="text-[0.9rem] font-medium uppercase tracking-wide text-text-secondary">
          {visualizacao === "aguardando"
            ? "Senhas aguardando"
            : "Senhas chamadas hoje"}
        </p>
        <p className="text-3xl font-bold text-primary">
          {visualizacao === "aguardando"
            ? senhasAguardando.length
            : senhasChamadasHoje.length}
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
            onAlternarPrioridade={handleAlternarPrioridade}
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
            onSelecionarSenha={handleChamarSenha}
            desabilitada={ocupado || Boolean(senhaAtual)}
          />
        )}
      </div>
      <div className="border-t border-border bg-page p-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleChamarProximo}
          disabled={!podeChamar}
        >
          Chamar próximo
        </Button>
      </div>
    </aside>
  );
};

export default SidePostos;
