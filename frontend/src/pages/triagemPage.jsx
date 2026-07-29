// Página do posto de triagem: reúne fila lateral e dados do aluno.
import PostoLayout from "../components/layout/PostoLayout";
import TriagemForm from "../components/sections/TriagemForm";

const TriagemPage = () => (
  <PostoLayout etapa="triagem">
    <TriagemForm />
  </PostoLayout>
);

export default TriagemPage;
