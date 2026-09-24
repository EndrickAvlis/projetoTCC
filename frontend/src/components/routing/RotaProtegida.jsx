// src/components/routing/RotaProtegida.jsx
import * as ReactRouter from "react-router-dom";
import { useAuth } from "../../context/authContext";

const RotaProtegida = ({ tela }) => {
  const { estaAutenticado, validandoSessao, temAcessoATela } = useAuth();
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

  // Se a rota exige uma tela específica e o usuário não tem permissão -> Acesso Negado
  if (tela && !temAcessoATela(tela)) {
    return <ReactRouter.Navigate to="/acesso-negado" replace />;
  }

  // Autorizado -> renderiza a rota filha correspondente
  return <ReactRouter.Outlet />;
};

export default RotaProtegida;
