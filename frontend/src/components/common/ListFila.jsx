// Grade reutilizável que mostra a senha atual e as listas da lateral do posto.
import { formatarSenha } from "../../utils/formatters";
const ListLine = ({
  senhas,
  senhaAtual,
  historico = false,
  onSelecionarSenha,
  onAlternarPrioridade,
  desabilitada = false,
  prioridadeDesabilitada = false,
}) => {
  // Exibe uma senha da fila como botão ou uma senha do histórico como informação somente leitura.
  const renderizarSenha = (senha) => {
    const className = [
      "min-h-16 rounded-btn border px-2 py-2 text-center font-bold text-primary transition-colors",
      senha.prioritaria ? "border-status-warning border-2" : "border-border",
      historico
        ? "bg-surface-muted text-text-secondary cursor-default"
        : "bg-page hover:bg-status-info-bg hover:border-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring",
      desabilitada && !historico ? "opacity-60 cursor-not-allowed" : "",
    ].join(" ");

    if (historico) {
      return (
        <div key={senha.id} className={className}>
          {senha.numero}
        </div>
      );
    }

    return (
      <button
        key={senha.id}
        type="button"
        className={className}
        disabled={desabilitada}
        onClick={() => onSelecionarSenha?.(senha)}
        aria-label={`Chamar senha ${senha.numero}`}
      >
        {senha ? formatarSenha(senha.numero):""}
      </button>
    );
  };

  const mensagemVazia = historico
    ? "Nenhuma senha foi chamada neste posto hoje."
    : "Nenhuma senha aguardando atendimento.";

  return (
    <div className="flex flex-col gap-4 p-4">
      {senhaAtual && (
        <div className="bg-primary text-text-inverse rounded-btn w-full px-4 py-3">
          <div className="text-[0.8rem] text-primary-text-muted uppercase tracking-wider font-bold">
            Em atendimento
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[1.5rem] font-bold tracking-wider">
              {senhaAtual ? formatarSenha(senhaAtual.numero) : ""}
            </span>
            {senhaAtual.prioritaria && (
              <span className="text-xs font-semibold uppercase">
                Prioritária
              </span>
            )}
          </div>
          {onAlternarPrioridade && (
            <button
              type="button"
              className="mt-3 rounded-btn border border-primary-border px-3 py-1 text-sm font-semibold hover:bg-primary-hover disabled:opacity-60"
              disabled={prioridadeDesabilitada}
              onClick={() => onAlternarPrioridade(!senhaAtual.prioritaria)}
            >
              {senhaAtual.prioritaria
                ? "Remover prioridade"
                : "Ativar prioridade"}
            </button>
          )}
        </div>
      )}

      {senhas.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {senhas.map(renderizarSenha)}
        </div>
      ) : (
        <p className="flex min-h-20 items-center justify-center rounded-btn border border-border bg-page px-3 text-center text-sm italic text-text-secondary">
          {mensagemVazia}
        </p>
      )}
    </div>
  );
};

export default ListLine;
