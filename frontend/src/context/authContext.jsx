import * as React from "react";
import * as authService from "../services/authService";

export const AuthContext = React.createContext(null);

const telasGerais = {
  admin: ["triagem", "apm", "docs", "admin", "secretaria"],
  supervisor: ["triagem", "apm", "docs", "admin", "secretaria"],
  atendente: ["triagem", "apm", "docs"],
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = React.useState(null);
  const [carregando, setCarregando] = React.useState(true);

  React.useEffect(() => {
    let ativo = true;

    authService
      .obterSessao()
      .then((dados) => {
        if (ativo) {
          setUsuario(dados);
        }
      })
      .catch(() => {
        if (ativo) {
          setUsuario(null);
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  React.useEffect(() => {
    const tratarNaoAutorizado = () => {
      setUsuario(null);
    };

    window.addEventListener("auth:unauthorized", tratarNaoAutorizado);
    return () => {
      window.removeEventListener("auth:unauthorized", tratarNaoAutorizado);
    };
  }, []);

  const login = React.useCallback(async (credenciais) => {
    const dados = await authService.logar(credenciais);
    setUsuario(dados);
    return dados;
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authService.deslogar();
    } finally {
      setUsuario(null);
    }
  }, []);

  const temAcessoATela = React.useCallback(
    (tela) => {
      if (!usuario) return false;
      
      const telasPermitidas = telasGerais[usuario.tipo] ?? [];
      return telasPermitidas.includes(tela);
    },
    [usuario],
  );

  const value = React.useMemo(
    () => ({
      usuario,
      estaAutenticado: Boolean(usuario),
      carregando,
      login,
      logout,
      temAcessoATela,
    }),
    [usuario, carregando, login, logout, temAcessoATela],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
};
