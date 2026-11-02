// src/components/routing/RotaProtegida.jsx
import * as ReactRouter from "react-router-dom";
import { useAuth } from "../../context/authContext";

const RotaProtegida = ({ tela }) => {
  const { usuario, estaAutenticado, validandoSessao, temAcessoATela } = useAuth();
  const location = ReactRouter.useLocation();

  if (validandoSessao) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-page">
        Validando sessão...
      </main>
    );
  }

  // Não está logado -> redireciona para o Login
  if (!estaAutenticado) {
    return <ReactRouter.Navigate to="/" replace state={{ origem: location.pathname }} />;
  }

  // Se tentar acessar outra tela que não a da sessão atual -> volta para a tela dele
  if (tela && !temAcessoATela(tela)) {
    return <ReactRouter.Navigate to={usuario?.tela ? `/${usuario.tela}` : "/"} replace />;
  }

  // Autorizado -> renderiza a rota filha correspondente
  return <ReactRouter.Outlet />;
};

export default RotaProtegida;
