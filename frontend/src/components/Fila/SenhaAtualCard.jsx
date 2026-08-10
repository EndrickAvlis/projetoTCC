// Cartão da senha em atendimento, separado da fila para acomodar ações futuras do atendimento.
import { formatarSenha } from "../../utils/formatters";

const SenhaAtualCard = ({ senha, onAlternarPrioridade, desabilitada = false }) => {
  if (!senha) return null;

  return (
    <section className="rounded-btn bg-primary px-4 py-3 text-text-inverse" aria-label="Senha em atendimento">
      <div className="text-[0.8rem] font-bold uppercase tracking-wider text-primary-text-muted">
        Em atendimento
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[1.5rem] font-bold tracking-wider">
          {formatarSenha(senha.numero)}
        </span>
        {senha.prioritaria && <span className="text-xs font-semibold uppercase">Prioritária</span>}
      </div>
      {onAlternarPrioridade && (
        <button
          type="button"
          className="mt-3 rounded-btn border border-primary-border px-3 py-1 text-sm font-semibold hover:bg-primary-hover disabled:opacity-60"
          disabled={desabilitada}
          onClick={onAlternarPrioridade}
        >
          {senha.prioritaria ? "Remover prioridade" : "Ativar prioridade"}
        </button>
      )}
    </section>
  );
};

export default SenhaAtualCard;
