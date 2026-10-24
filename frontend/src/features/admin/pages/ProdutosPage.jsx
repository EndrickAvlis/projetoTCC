import * as React from "react";

import Tabs from "../../../components/ui/Tabs";
import SecaoUniformes from "../components/produtos/uniformes/SecaoUniformes";
import SecaoArmarios from "../components/produtos/armarios/SecaoArmarios";

const abasProdutos = [
  { id: "uniformes", label: "Uniformes"},
  { id: "armarios", label: "Armários"},
];

const ProdutosPage = () => {
  const [abaAtiva, setAbaAtiva] = React.useState("uniformes");

  return (
    <div className="space-y-6">
      <Tabs
        itens={abasProdutos}
        ativo={abaAtiva}
        onSelecionar={setAbaAtiva}
        ariaLabel="Produtos"
      />

      {abaAtiva === "uniformes" ? (
        <SecaoUniformes />
      ) : (
        <SecaoArmarios />
      )}
    </div>
  );
};

export default ProdutosPage;