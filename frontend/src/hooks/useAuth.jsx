// Hook usado pelos componentes para acessar a sessão e as permissões do usuário.
import { useContext } from "react";
import { AuthContext } from "../context/authContextBase";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
};
