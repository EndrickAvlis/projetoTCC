// Grade visual somente leitura para as senhas cujo atendimento foi iniciado no posto.
import { formatarSenha } from "../../utils/formatters";

const HistoricoGrid = ({ senhas }) => {
  // Renderiza uma senha histórica sem ação de clique para evitar uma chamada indevida.
  const renderizarSenha = (senha) => (
    <div
      key={senha.id}
      className="min-h-16 rounded-btn border border-border bg-surface-muted px-2 py-2 text-center font-bold text-text-secondary"
    >
      {formatarSenha(senha.numero)}
    </div>
  );

  if (senhas.length === 0) {
    return (
      <p className="flex min-h-20 items-center justify-center rounded-btn border border-border bg-page px-3 text-center text-sm italic text-text-secondary">
        Nenhuma senha foi chamada neste posto hoje.
      </p>
    );
  }

  return <div className="grid grid-cols-3 gap-2">{senhas.map(renderizarSenha)}</div>;
};

export default HistoricoGrid;
