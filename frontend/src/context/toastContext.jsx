import * as React from "react";
import Toast from "../components/ui/Toast";

const ToastContext = React.createContext(null);

const DURACAO_PADRAO_MS = 4000;
const DURACAO_CONFIRMACAO_MS = 3000;

export const ToastProvider = ({ children }) => {
  const [toastAtivo, setToastAtivo] = React.useState(null);
  const temporizadorRef = React.useRef(null);

  const fecharToast = React.useCallback(() => {
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
    setToastAtivo(null);
  }, []);

  const exibirToast = (tipo, mensagem, duracao = DURACAO_PADRAO_MS, fechavel = true) => {
    if (!mensagem) return;

    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
    }

    setToastAtivo({ tipo, mensagem, fechavel });

    temporizadorRef.current = setTimeout(() => {
      setToastAtivo(null);
      temporizadorRef.current = null;
    }, duracao);
  };

  React.useEffect(() => {
    const escutarLegado = (evento) => {
      if (evento.detail) {
        exibirToast("error", evento.detail);
      }
    };

    window.addEventListener("api:erro", escutarLegado);
    return () => {
      window.removeEventListener("api:erro", escutarLegado);
      if (temporizadorRef.current) {
        clearTimeout(temporizadorRef.current);
      }
    };
  }, [exibirToast]);

  const toast = {
    erro: (mensagem) => exibirToast("error", mensagem),
    sucesso: (mensagem) => exibirToast("success", mensagem),
    alerta: (mensagem) => exibirToast("warning", mensagem),
    info: (mensagem) => exibirToast("info", mensagem),
    confirmacao: (mensagem) =>
      exibirToast("success", mensagem, DURACAO_CONFIRMACAO_MS, false),
    fechar: fecharToast,
    error: (mensagem) => exibirToast("error", mensagem),
    success: (mensagem) => exibirToast("success", mensagem),
  };

  return (
    <ToastContext.Provider value={{ toast, toastAtivo, fecharToast }}>
      {children}
      <Toast />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const contexto = React.useContext(ToastContext);
  if (!contexto) {
    throw new Error("useToast deve ser utilizado dentro de um ToastProvider.");
  }
  return contexto.toast;
};

export default ToastContext;
