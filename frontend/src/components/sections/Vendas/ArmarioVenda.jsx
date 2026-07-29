// Opção de incluir um armário na venda quando o catálogo permitir.
import { formatarMoeda } from "../../../utils/formatters";

const ArmarioVenda = ({ armario, permitido = false, onChange, disabled = false }) => {
  if (!permitido) return null;

  return (
    <section className="bg-white border border-border rounded-lg p-5 flex flex-col justify-between gap-4">
      <div>
        <h2 className="text-section font-semibold text-primary">Armário</h2>
        <p className="text-sm text-gray-600">{formatarMoeda(armario.preco)}</p>
        <p className="text-sm text-gray-500">{armario.estoque} disponível(is)</p>
      </div>
      <label className="inline-flex self-end items-center gap-3 cursor-pointer text-sm text-gray-700">
        <span>{armario.incluido ? "Sim" : "Não"}</span>
        <input
          type="checkbox"
          className="sr-only peer"
          checked={armario.incluido}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
        />
        <span className="relative h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-primary peer-disabled:opacity-60 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
      </label>
    </section>
  );
};

export default ArmarioVenda;
