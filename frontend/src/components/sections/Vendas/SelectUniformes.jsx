// Seletor usado para adicionar uniformes disponíveis no catálogo à venda.
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import { formatarMoeda } from "../../../utils/formatters";

const SelectUniformes = ({ uniformes = [], onAdicionar, disabled = false }) => {
  const [uniformeSelecionado, setUniformeSelecionado] = useState("");
  const options = uniformes.map((uniforme) => ({
    value: uniforme.id,
    label: `${uniforme.tamanho} — ${formatarMoeda(uniforme.preco)} (estoque: ${uniforme.estoque})`,
  }));

  const adicionar = () => {
    if (!uniformeSelecionado) return;
    onAdicionar(uniformeSelecionado);
    setUniformeSelecionado("");
  };

  return (
    <section className="bg-white border border-border rounded-lg p-5 space-y-4">
      <div>
        <h2 className="text-section font-semibold text-primary">Uniformes</h2>
        <p className="text-sm text-gray-500">Itens sem estoque também podem ser vendidos e ficam pendentes para retirada.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          aria-label="Selecionar uniforme"
          value={uniformeSelecionado}
          onChange={(event) => setUniformeSelecionado(event.target.value)}
          options={options}
          placeholder="Selecionar uniforme..."
          disabled={disabled}
          className="flex-1"
          size="md"
        />
        <Button
          onClick={adicionar}
          disabled={disabled || !uniformeSelecionado}
          leftIcon={<IoMdAdd size={18} />}
        >
          Adicionar
        </Button>
      </div>
    </section>
  );
};

export default SelectUniformes;
