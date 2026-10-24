import * as React from "react";

import Tabs from "../../../components/ui/Tabs";
import SecaoAtendimento from "../components/postos/atendimento/SecaoAtendimento";
import SecaoFilas from "../components/postos/filas/SecaoFilas";
import SecaoAuditoria from "../components/postos/auditoria/SecaoAuditoria";

const abasPostos = [
  { id: "atendimento", label: "Atendimento" },
  { id: "filas", label: "Filas"},
  { id: "auditoria", label: "Auditoria" },
];

const PostosPage = () => {
  const [abaAtiva, setAbaAtiva] = React.useState("atendimento");

  return (
    <div className="space-y-6">
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
