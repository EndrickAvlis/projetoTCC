// Carrega os cursos da API e combina com os anos e períodos fixos do sistema.
import { useEffect, useState } from "react";
import { ANOS_CURSO, PERIODOS_CURSO } from "../constants/cursoOptions";
import { listarCursos } from "../services/triagemService";

export const useSelectsTriagem = () => {
  const [cursos, setCursos] = useState([]);
  const [carregandoCursos, setCarregandoCursos] = useState(true);
  const [erroCursos, setErroCursos] = useState(null);

  useEffect(() => {
    let ativo = true;

    const carregarCursos = async () => {
      try {
        const catalogo = await listarCursos();
        if (ativo) setCursos(catalogo);
      } catch (erro) {
        if (ativo) setErroCursos(erro.message);
      } finally {
        if (ativo) setCarregandoCursos(false);
      }
    };

    carregarCursos();
    return () => { ativo = false; };
  }, []);

  return {
    cursos,
    anos: ANOS_CURSO,
    periodos: PERIODOS_CURSO,
    carregandoCursos,
    catalogoDisponivel: cursos.length > 0,
    erroCursos,
  };
};
