// Protege uma rota usando a sessão e as telas permitidas pelo backend.
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const RotaProtegida = ({ tela, children }) => {
  const { estaAutenticado, validandoSessao, temAcessoATela } = useAuth();
  const location = useLocation();

  if (validandoSessao) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        Validando sessão...
      </main>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/" replace state={{ origem: location.pathname }} />;
  }

  if (!temAcessoATela(tela)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
};

export default RotaProtegida;
