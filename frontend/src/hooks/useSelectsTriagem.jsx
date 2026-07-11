import { useState, useEffect } from "react";

export const useSelectsTriagem = () => {
  const [cursos, setCursos] = useState([]);
  const [carregandoCursos, setCarregandoCursos] = useState(true);

  // Dados fixos de infraestrutura (não mudam com frequência)
  const anos = [
    { value: 1, label: "1º" },
    { value: 2, label: "2º" },
    { value: 3, label: "3º" },
  ];

  const periodos = [
    { value: "manha", label: "Manhã" },
    { value: "tarde", label: "Tarde" },
    { value: "noite", label: "Noite" },
    { value: "periodo", label: "Período" },
  ];

  useEffect(() => {
    // FUTURO BACKEND:
    // fetch('/api/cursos')
    //   .then(res => res.json())
    //   .then(data => { setCursos(data); setCarregandoCursos(false); })

    const cursosMock = [
      { value: "DS", label: "Desenvolvimento de Sistemas" },
      { value: "Edif", label: "Edificações" },
      { value: "Meca", label: "Mecatrônica" },
      { value: "Protese", label: "Prótese Dentária" },
    ];

    // Simula um pequeno delay de rede de 500ms
    const timer = setTimeout(() => {
      setCursos(cursosMock);
      setCarregandoCursos(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    anos,
    periodos,
    cursos,
    carregandoCursos,
  };
};
