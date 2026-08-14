// Protege uma rota usando a sessão e as telas permitidas pelo backend.
import * as ReactRouter from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const RotaProtegida = ({ tela, children }) => {
  const { estaAutenticado, validandoSessao, temAcessoATela } = useAuth();
  const location = ReactRouter.useLocation();

  if (validandoSessao) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-page">
        Validando sessão...
      </main>
    );
  }

  if (!estaAutenticado) {
    return <ReactRouter.Navigate to="/" replace state={{ origem: location.pathname }} />;
  }

  if (!temAcessoATela(tela)) {
    return <ReactRouter.Navigate to="/acesso-negado" replace />;
  }

  return children;
};

export default RotaProtegida;
