import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import Select from "../../../../components/ui/Select";
import Button from "../../../../components/ui/Button";
import { formatarMoeda } from "../../../../utils/formatters";

const SelectUniformes = ({ uniformes = [], onAdicionar, disabled = false }) => {
  const [uniformeSelecionado, setUniformeSelecionado] = useState("");

  const options = uniformes.map((unifome) => ({
    value: String(unifome.id),
    label: `${unifome.nome} — ${formatarMoeda(unifome.preco)} (Estoque: ${unifome.quantidade})`,
  }));

  const handleAdicionar = () => {
    if (!uniformeSelecionado) return;
    onAdicionar(Number(uniformeSelecionado));
    setUniformeSelecionado("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          aria-label="Selecionar uniforme"
          value={uniformeSelecionado}
          onChange={(e) => setUniformeSelecionado(e.target.value)}
          options={options}
          placeholder="Selecione um tamanho de uniforme..."
          disabled={disabled}
          className="flex-1"
          size="md"
        />
        <Button
          onClick={handleAdicionar}
          disabled={disabled || !uniformeSelecionado}
          rightIcon={<FiPlus />}
        >
          Adicionar
        </Button>
      </div>
      <p className="text-xs text-text-secondary">
        Itens com quantidade superior ao estoque ficarão registrados como pendentes de retirada.
      </p>
    </div>
  );
};

export default SelectUniformes;