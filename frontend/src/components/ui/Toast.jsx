import * as React from "react";
import Alert from "./Alert";
import ToastContext from "../../context/toastContext";

const Toast = () => {
  const contexto = React.useContext(ToastContext);
  if (!contexto?.toastAtivo) return null;

  const { tipo, mensagem, fechavel } = contexto.toastAtivo;

  return (
    <aside
      aria-live="polite"
      className="fixed right-4 bottom-4 z-60 w-80 max-w-[calc(100vw-2rem)] shadow-lg transition-all duration-300"
    >
      <Alert
        type={tipo}
        message={mensagem}
        onClose={fechavel ? contexto.fecharToast : null}
      />
    </aside>
  );
};

export default Toast;
