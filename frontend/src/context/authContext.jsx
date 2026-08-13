// Contexto da sessão: persiste o usuário autenticado e suas permissões.
import * as React from "react";
import { obterSessaoAtual } from "../services/authService";
import { AuthContext } from "./authContextBase";

const AUTH_STORAGE_KEY = "tcc.auth";

const recuperarSessao = () => {
  try {
    const sessao = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));

    if (!sessao?.token || !Array.isArray(sessao.telasPermitidas)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return sessao;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const montarSessao = (
  {
    token,
    usuario,
    telasPermitidas,
    telaAtual,
    postoAtual,
    guiche,
  },
  tokenAnterior = null,
) => {
  if (
    !usuario?.id ||
    !usuario?.nome ||
    !Array.isArray(telasPermitidas) ||
    !(token ?? tokenAnterior)
  ) {
    throw new Error("A API retornou uma sessão inválida.");
  }

  return {
    token: token ?? tokenAnterior,
    id: usuario.id,
    nome: usuario.nome,
    tipo: usuario.tipo,
    telasPermitidas,
    telaAtual,
    postoAtual,
    guiche,
  };
};

export const AuthProvider = ({ children }) => {
  const [sessaoInicial] = React.useState(recuperarSessao);
  const [usuario, setUsuario] = React.useState(sessaoInicial);
  const [validandoSessao, setValidandoSessao] = React.useState(
    Boolean(sessaoInicial),
  );

  React.useEffect(() => {
    if (usuario) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(usuario));
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [usuario]);

  React.useEffect(() => {
    const removerSessaoInvalida = () => {
      setUsuario(null);
      setValidandoSessao(false);
    };
    window.addEventListener("auth:unauthorized", removerSessaoInvalida);
    return () =>
      window.removeEventListener("auth:unauthorized", removerSessaoInvalida);
  }, []);

  React.useEffect(() => {
    if (!sessaoInicial) return;

    let ativo = true;

    // Valida no backend a sessão que foi recuperada após recarregar a página.
    obterSessaoAtual()
      .then((resposta) => {
        if (!ativo) return;
        setUsuario(montarSessao(resposta, sessaoInicial.token));
      })
      .catch(() => {
        if (ativo) setUsuario(null);
      })
      .finally(() => {
        if (ativo) setValidandoSessao(false);
      });

    return () => {
      ativo = false;
    };
  }, [sessaoInicial]);

  // Registra somente a sessão que o POST /auth/login devolveu após validar acesso.
  const registrarSessao = React.useCallback((resposta) => {
    const sessao = montarSessao(resposta);

    setUsuario(sessao);
    return sessao;
  }, []);

  const temAcessoATela = React.useCallback(
    (tela) => Boolean(usuario?.telasPermitidas?.includes(tela)),
    [usuario],
  );

  // Limpa a sessão local depois da tentativa de encerrar a sessão no servidor.
  const logout = React.useCallback(() => {
    setUsuario(null);
    setValidandoSessao(false);
  }, []);

  const value = React.useMemo(
    () => ({
      usuario,
      estaAutenticado: Boolean(usuario),
      validandoSessao,
      registrarSessao,
      temAcessoATela,
      logout,
    }),
    [
      usuario,
      validandoSessao,
      registrarSessao,
      temAcessoATela,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
