// Página do posto APM: reúne fila lateral e formulário de vendas.
import PostoLayout from "../components/layout/PostoLayout";
import ApmVendas from "../components/layout/ApmVendas";

const ApmPage = () => (
  <PostoLayout etapa="apm">
    <ApmVendas />
  </PostoLayout>
);

export default ApmPage;
