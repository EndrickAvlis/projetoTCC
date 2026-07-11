import Button from "../ui/button";
import ListLine from "../parts/listLine";

// Componente puramente visual - não precisa de alterações para o backend
// Apenas repassa props para os filhos
const SidePostos = ({
  pessoasEsperando,
  proximasSenhas,
  senhaAtual,
  podeChamar,
  podeRechamar,
  podeCancelar,
  onChamar,
  onRechamar,
  onCancelar,
}) => {
  // TODO: Remover - log de debug
  console.log("SidePostos - senhaAtual:", senhaAtual);
  
  return (
    <div className="w-70 h-screen bg-white border-r border-border flex flex-col">
      {/* Contador */}
      <div className="p-4 border-b border-border bg-background flex flex-col items-center justify-center gap-1">
        <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
          Aguardando
        </p>
        <p className="text-3xl font-bold text-primary">{pessoasEsperando}</p>
      </div>

      {/* Lista de senhas */}
      <div className="flex-1 overflow-y-auto">
        <ListLine
          senhas={proximasSenhas}
          variant="sidepanel"
          senhaAtual={senhaAtual}
        />
      </div>

      {/* Botões */}
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <Button variant="primary" onClick={onChamar} disabled={!podeChamar}>
          Chamar
        </Button>
        <Button
          variant="secondary"
          onClick={onRechamar}
          disabled={!podeRechamar}
        >
          Rechamar
        </Button>
        <Button variant="danger" onClick={onCancelar} disabled={!podeCancelar}>
          Encerrar
        </Button>
      </div>
    </div>
  );
};

export default SidePostos;