// Página do posto de documentos: reúne fila lateral e conferência final.
import PostoLayout from "../components/layout/PostoLayout";
import DocsPanel from "../components/sections/DocsPanel";

const DocsPage = () => (
  <PostoLayout etapa="docs">
    <DocsPanel />
  </PostoLayout>
);

export default DocsPage;
