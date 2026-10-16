import * as React from "react";
import { FiActivity, FiList, FiClock } from "react-icons/fi";

import Tabs from "../../../components/ui/Tabs";
import SecaoAtendimento from "../components/postos/atendimento/SecaoAtendimento";
import SecaoFilas from "../components/postos/filas/SecaoFilas";
import SecaoAuditoria from "../components/postos/auditoria/SecaoAuditoria";

const abasPostos = [
  { id: "atendimento", label: "Atendimento", icone: FiActivity },
  { id: "filas", label: "Filas", icone: FiList },
  { id: "auditoria", label: "Auditoria", icone: FiClock },
];

const PostosPage = () => {
  const [abaAtiva, setAbaAtiva] = React.useState("atendimento");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">Postos</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Acompanhamento em tempo real, monitoramento de filas e histórico de atendimentos.
        </p>
      </header>

      <Tabs
        itens={abasPostos}
        ativo={abaAtiva}
        onSelecionar={setAbaAtiva}
        ariaLabel="Abas de postos"
      />

      {abaAtiva === "atendimento" && <SecaoAtendimento />}
      {abaAtiva === "filas" && <SecaoFilas />}
      {abaAtiva === "auditoria" && <SecaoAuditoria />}
    </div>
  );
};

export default PostosPage;
