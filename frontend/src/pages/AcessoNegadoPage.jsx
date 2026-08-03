// Tela apresentada quando o perfil autenticado não possui acesso à rota.
import { Link } from "react-router-dom";

const AcessoNegadoPage = () => (
  <main className="min-h-screen flex items-center justify-center bg-page p-4">
    <section className="bg-surface border border-border rounded-lg p-8 max-w-md w-full text-center">
      <h1 className="text-title font-bold text-primary">Acesso não autorizado</h1>
      <p className="text-body text-text-secondary mt-3">
        Seu tipo de usuário não tem permissão para acessar esta funcionalidade.
      </p>
      <Link className="inline-block mt-6 text-primary underline" to="/">
        Voltar ao login
      </Link>
    </section>
  </main>
);

export default AcessoNegadoPage;
