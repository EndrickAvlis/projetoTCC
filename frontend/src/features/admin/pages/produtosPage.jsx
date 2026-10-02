import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Tabs from "../../../components/ui/Tabs";
import SecaoUniformes from "../components/produtos/uniformes/SecaoUniformes";
import SecaoArmarios from "../components/produtos/armarios/SecaoArmarios";

const abasProdutos = [
  { id: "uniformes", label: "Uniformes", icone: FiIcons.FiTag },
  { id: "armarios", label: "Armários", icone: FiIcons.FiBox },
];

const ProdutosPage = () => {
  const [tipoSelecionado, setTipoSelecionado] = React.useState("uniformes");

  return (
    <div className="space-y-6">
      <Tabs
        itens={abasProdutos}
        ativo={tipoSelecionado}
        onSelecionar={setTipoSelecionado}
        ariaLabel="Produtos"
      />

      {tipoSelecionado === "uniformes" ? (
        <SecaoUniformes />
      ) : (
        <SecaoArmarios />
      )}
    </div>
  );
};

export default ProdutosPage;