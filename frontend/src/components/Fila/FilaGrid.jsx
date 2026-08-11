// Grade visual de senhas aguardando: recebe dados e eventos sem conhecer serviços ou hooks.
import { formatarSenha } from "../../utils/formatters";

const FilaGrid = ({ senhas, onSelecionarSenha, desabilitada = false }) => {
  // Renderiza uma senha clicável que delega a reserva ao componente responsável pelo fluxo.
  const renderizarSenha = (senha) => (
    <button
      key={senha.id}
      type="button"
      className={[
        "min-h-16 rounded-btn border px-2 py-2 text-center font-bold text-primary transition-colors",
        senha.prioritaria ? "border-status-warning border-2" : "border-border",
        "bg-page hover:bg-status-info-bg hover:border-primary cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-focus-ring",
        desabilitada ? "opacity-60 cursor-not-allowed" : "",
      ].join(" ")}
      disabled={desabilitada}
      onClick={() => onSelecionarSenha(senha)}
      aria-label={`Chamar senha ${senha.numero}`}
    >
      {formatarSenha(senha.numero)}
    </button>
  );

  if (senhas.length === 0) {
    return (
      <p className="flex min-h-20 items-center justify-center rounded-btn border border-border bg-page px-3 text-center text-sm italic text-text-secondary">
        Nenhuma senha aguardando atendimento.
      </p>
    );
  }

  return <div className="grid grid-cols-3 gap-2">{senhas.map(renderizarSenha)}</div>;
};

export default FilaGrid;
