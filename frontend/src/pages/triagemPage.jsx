import { useState, useEffect } from "react";
import SidePostos from "../components/sections/SidePostos";
import Header from "../components/sections/Header";
import TriagemForm from "../components/sections/TriagemForm";
import { useAtendimento } from "../context/atendimentoContext";
import { useFila } from "../hooks/useFila";
import { Navigate, useNavigate } from "react-router-dom";

const TelaTriagem = () => {
  const { senhaAtual, setSenhaAtual, atendendo, setAtendendo } =
    useAtendimento();
  const { chamarSenha, cancelarSenha, finalizarSenha, senhasAguardando } = useFila();
  const navigate = useNavigate;

  // TODO: Requisição para back.
  const handleChamar = () => {
    const proxima = chamarSenha();
    if (!proxima) return;
    setSenhaAtual(proxima);
    setAtendendo(false);
  };

  // TODO: Requisição para back no websocket.
  const handleRechamar = () => {
    console.log("Rechamando a senha:", senhaAtual.numero)
    // Backend - emitir notificação para painel TV
    // Pode ser via WebSocket (socket.emit('rechamar', { senha: senhaAtual }))
    // ou via endpoint POST /api/painel/rechamar
  };

  // TODO: Requisição para back.
  const handleCancelar = () => {
    cancelarSenha(senhaAtual);
    setSenhaAtual(null);
  };

  return (
    <div className="flex h-screen">
      <SidePostos
        pessoasEsperando={senhasAguardando.length}
        proximasSenhas={senhasAguardando}
        senhaAtual={senhaAtual}
        podeChamar={!senhaAtual}
        podeRechamar={!!senhaAtual}
        podeCancelar={!!senhaAtual}
        onChamar={handleChamar}
        onRechamar={handleRechamar}
        onCancelar={handleCancelar}
      />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header />
        {/* Conteúdo */}
        <main className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center">
          <TriagemForm finalizarSenha={ finalizarSenha}/>
        </main>
      </div>
    </div>
  );
};

export default TelaTriagem;
