import { useState, useEffect } from "react";
import SidePostos from "../components/sections/sidePostos";
// import HeaderPrincipal from "../components/sections/headerPrincipal";

const TelaTriagem = () => {
  const [fila, setFila] = useState([]);
  const [senhaAtual, setSenhaAtual] = useState(null);

  // TODO: Remover - dados mockados, serão substituídos pela resposta da API
  const dadosIniciais = [
    { numero: "A001", horario: "10:00", status: "aguardando" },
    { numero: "A002", horario: "10:05", status: "aguardando" },
    { numero: "A003", horario: "10:10", status: "aguardando" },
    { numero: "A004", horario: "10:15", status: "aguardando" },
    { numero: "A005", horario: "10:20", status: "aguardando" },
    { numero: "A006", horario: "10:00", status: "aguardando" },
    { numero: "A007", horario: "10:05", status: "aguardando" },
    { numero: "A008", horario: "10:10", status: "aguardando" },
    { numero: "A009", horario: "10:15", status: "aguardando" },
    { numero: "A0010", horario: "10:20", status: "aguardando" },
  ];

  useEffect(() => {
    // TODO: Backend - substituir dados mockados pela chamada real
    // fetch('/api/fila?posto=triagem')
    //   .then(res => res.json())
    //   .then(data => setFila(data))
    //   .catch(err => console.error('Erro ao carregar fila:', err));
    //
    // TODO: Backend - ativar polling para atualização em tempo real
    // const intervalo = setInterval(buscarFila, 3000);
    // return () => clearInterval(intervalo);
    setFila(dadosIniciais);
  }, []);

  // Mantido - filtro local (quando dados vierem do backend, continuará funcionando)
  const senhasAguardando = fila.filter((s) => s.status === "aguardando");

  const handleChamar = () => {
    if (senhasAguardando.length === 0) return;

    const proxima = senhasAguardando[0];

    // TODO: Backend - enviar PATCH /api/senha/:id { status: "em_atendimento", guiche: "X" }
    // await fetch(`/api/senha/${proxima.id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    //   body: JSON.stringify({ status: 'em_atendimento' })
    // });

    console.log("Senha atual definida:", proxima); // TODO: Remover - log de debug
    setSenhaAtual(proxima);
    setFila((prev) =>
      prev.map((s) =>
        s.numero === proxima.numero ? { ...s, status: "em_atendimento" } : s,
      ),
    );
  };

  const handleRechamar = () => {
    // TODO: Backend - emitir notificação para painel TV
    // Pode ser via WebSocket (socket.emit('rechamar', { senha: senhaAtual }))
    // ou via endpoint POST /api/painel/rechamar
    console.log("Rechamando:", senhaAtual?.numero); // TODO: Remover - log de debug
  };

  const handleCancelar = () => {
    // TODO: Backend - enviar PATCH /api/senha/:id { status: "cancelada" }
    // await fetch(`/api/senha/${senhaAtual.id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    //   body: JSON.stringify({ status: 'cancelada' })
    // });

    setFila((prev) =>
      prev.map((s) =>
        s.numero === senhaAtual.numero ? { ...s, status: "cancelada" } : s,
      ),
    );
    setSenhaAtual(null);
  };

  return (
    <div>
      {/* <HeaderPrincipal /> */}
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
    </div>
  );
};

export default TelaTriagem;