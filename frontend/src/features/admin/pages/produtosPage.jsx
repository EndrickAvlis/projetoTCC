import * as React from "react";
import ProdutosTipoSelector from "../components/produtos/ProdutosTipoSelector";
import SecaoUniformes from "../components/produtos/uniformes/SecaoUniformes";
import SecaoArmarios from "../components/produtos/armarios/SecaoArmarios";

const ProdutosPage = () => {
  const [tipoSelecionado, setTipoSelecionado] = React.useState("uniformes");

  return (
    <div className="space-y-6">
      <ProdutosTipoSelector
        tipoSelecionado={tipoSelecionado}
        onSelecionar={setTipoSelecionado}
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