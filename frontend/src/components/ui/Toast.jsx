import * as React from "react";
import Alert from "./Alert";

const DURACAO_MS = 5000;

const Toast = () => {
  const [mensagem, setMensagem] = React.useState(null);

  React.useEffect(() => {
    let temporizador;

    const exibir = (evento) => {
      setMensagem(evento.detail);
      clearTimeout(temporizador);
      temporizador = setTimeout(() => setMensagem(null), DURACAO_MS);
    };

    window.addEventListener("api:erro", exibir);
    return () => {
      window.removeEventListener("api:erro", exibir);
      clearTimeout(temporizador);
    };
  }, []);

  if (!mensagem) return null;

  return (
    <div role="alert" className="fixed right-4 bottom-4 z-60 w-80 shadow-lg">
      <Alert type="error" message={mensagem} onClose={() => setMensagem(null)} />
    </div>
  );
};

export default Toast;
