import { useState } from "react";
import ArmarioVenda from "./features/postos/components/apm/ArmarioVenda";

const Testes = () => {
  const [incluido, setIncluido] = useState(false);

  const mockArmario = {
    preco: 50.0,
    estoque: 5,
    incluido: incluido,
  };

  return (
    <div className="min-h-screen bg-page p-8 flex flex-col gap-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-text-primary">Laboratório de Testes</h1>

      <section className="bg-surface p-4 rounded-lg border border-border flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-secondary">
          1. Teste Interativo (Vários disponíveis)
        </h2>
        <ArmarioVenda
          armario={mockArmario}
          onChange={setIncluido}
          disabled={false}
        />
        <span className="text-xs text-text-secondary">
          Estado atual: <strong>{incluido ? "Incluído" : "Não incluído"}</strong>
        </span>
      </section>

      <section className="bg-surface p-4 rounded-lg border border-border flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-secondary">
          2. Teste Singular (Apenas 1 disponível)
        </h2>
        <ArmarioVenda
          armario={{ preco: 60.0, estoque: 1, incluido: false }}
          onChange={() => {}}
          disabled={false}
        />
      </section>

      <section className="bg-surface p-4 rounded-lg border border-border flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-secondary">
          3. Teste Desabilitado
        </h2>
        <ArmarioVenda
          armario={{ preco: 50.0, estoque: 3, incluido: true }}
          onChange={() => {}}
          disabled={true}
        />
      </section>
    </div>
  );
};

export default Testes;