import { formatarMoeda } from "../../../../utils/formatters";
import Toggle from "../../../../components/ui/Toggle";

const ArmarioVenda = ({ armario, onChange, disabled = false }) => {
    if(!armario?.disponivel) {
        return null
    }
  if (!armario?.estoque || armario.estoque <= 0) {
    return null;
  }

  const textoDisponibilidade = `${armario.estoque} ${
    armario.estoque === 1 ? "disponível" : "disponíveis"
  }`;

  return (
    <div className="flex flex-1 flex-col justify-between gap-2 rounded-lg border border-border bg-page p-4">
      <div>
        <h3 className="font-semibold text-text-primary">Armário</h3>
        <p className="text-sm text-text-secondary">
          {formatarMoeda(armario.preco)} • {textoDisponibilidade}
        </p>
      </div>
      <div className="flex items-center justify-start gap-2">
        <Toggle
          checked={Boolean(armario.incluido)}
          onChange={onChange}
          disabled={disabled}
        />
        <p className="text-sm font-semibold text-text-primary ">Incluir Armário na Venda</p>
      </div>
    </div>
  );
};

export default ArmarioVenda;
