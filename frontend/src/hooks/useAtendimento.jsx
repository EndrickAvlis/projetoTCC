// Hook usado pelos postos para acessar os dados do atendimento em andamento.
import { useContext } from "react";
import { AtendimentoContext } from "../context/atendimentoContextBase";

export const useAtendimento = () => {
  const context = useContext(AtendimentoContext);

  if (!context) {
    throw new Error("useAtendimento deve ser usado dentro de AtendimentoProvider.");
  }

  return context;
};
