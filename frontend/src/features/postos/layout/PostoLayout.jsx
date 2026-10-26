import * as React from "react";
import Header from "./Header";
import SidePostos from "./SidePostos";
import { useAtendimento } from "../context/atendimentoContext";

const PostoLayout = ({ etapa, children }) => {
  const { recuperarAtendimentoAtivo } = useAtendimento();

  React.useEffect(() => {
    if (etapa) {
      void recuperarAtendimentoAtivo(etapa);
    }
  }, [etapa, recuperarAtendimentoAtivo]);

  return (
    <div className="flex h-screen" aria-label={`Posto de ${etapa}`}>
      <SidePostos etapa={etapa} />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex flex-1 flex-col items-stretch justify-start gap-4 overflow-y-auto overflow-x-hidden bg-page p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PostoLayout;
