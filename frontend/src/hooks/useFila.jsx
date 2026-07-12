import { useState, useEffect } from "react";

export const useFila = () => {
  const [fila, setFila] = useState([]);

  // * mock inicial (depois vira API)
  useEffect(() => {
    const dadosIniciais = [
      {
        numero: "A001",
        horario: "10:00",
        status: "aguardando",
        etapa: "triagem",
      },
      {
        numero: "A002",
        horario: "10:05",
        status: "aguardando",
        etapa: "triagem",
      },
      {
        numero: "A003",
        horario: "10:10",
        status: "aguardando",
        etapa: "triagem",
      },
      { numero: "A004", horario: "10:15", status: "aguardando", etapa: "apm" },
      { numero: "A005", horario: "10:20", status: "aguardando", etapa: "apm" },
      { numero: "A006", horario: "10:00", status: "aguardando", etapa: "docs" },
      { numero: "A007", horario: "10:05", status: "aguardando", etapa: "apm" },
      { numero: "A008", horario: "10:10", status: "aguardando", etapa: "docs" },
      {
        numero: "A009",
        horario: "10:15",
        status: "aguardando",
        etapa: "docs",
      },
      {
        numero: "A0010",
        horario: "10:20",
        status: "aguardando",
        etapa: "docs",
      },
    ];

    setFila(dadosIniciais);
  }, []);

  const senhasAguardando = fila.filter((s) => s.status === "aguardando");

  const chamarSenha = () => {
    if (senhasAguardando.length === 0) {
      console.log("Sem senhas");
      return null;
    }

    const proxima = senhasAguardando[0];

    console.log("Chamando:", proxima.numero);

    //TODO: Mudança será feita pelo back
    setFila((prev) =>
      prev.map((s) =>
        s.numero === proxima.numero ? { ...s, status: "em_atendimento" } : s,
      ),
    );

    return proxima;
  };

  const cancelarSenha = (senhaAtual) => {
    console.log("Cancelando:", senhaAtual?.numero);

    //TODO: Mudança será feita pelo back
    setFila((prev) =>
      prev.map((s) =>
        s.numero === senhaAtual.numero ? { ...s, status: "cancelada" } : s,
      ),
    );
  };

  const avancarSenha = (senhaAtual) => {
    if (!senhaAtual) return;

    let proximaEtapa = null;

    if (senhaAtual.etapa === "triagem") proximaEtapa = "apm";
    else if (senhaAtual.etapa === "apm") proximaEtapa = "docs";

    if (!proximaEtapa) return;

    console.log(`➡️ Avançando ${senhaAtual.numero} para ${proximaEtapa}`);

    setFila((prev) =>
      prev.map((s) =>
        s.numero === senhaAtual.numero
          ? {
              ...s,
              status: "aguardando",
              etapa: proximaEtapa,
            }
          : s,
      ),
    );
  };

  //TODO: O finalizar vai mudar o status e a etapa da senha passando para a proxima
  // TODO no futuro vai ter alguma forma de saber para qual etapa a senha vai.
  const finalizarSenha = (senhaAtual) => {
    console.log("Finalizada:", senhaAtual?.numero);

    //TODO: Mudança será feita pelo back
    setFila((prev) =>
      prev.map((s) =>
        s.numero === senhaAtual.numero
          ? { ...s, status: "finalizada", etapa: "apm" }
          : s,
      ),
    );
  };

  return {
    fila,
    senhasAguardando,
    chamarSenha,
    cancelarSenha,
    finalizarSenha,
    avancarSenha,
  };
};
