// Carrega os cursos da API e combina com os anos e períodos fixos do sistema.
import * as React from "react";
import * as CursoOptions from "../constants/cursoOptions";
import { listarCursos } from "../services/triagemService";

export const useSelectsTriagem = () => {
  const [cursos, setCursos] = React.useState([]);
  const [carregandoCursos, setCarregandoCursos] = React.useState(true);
  const [erroCursos, setErroCursos] = React.useState(null);

  React.useEffect(() => {
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
    anos: CursoOptions.ANOS_CURSO,
    periodos: CursoOptions.PERIODOS_CURSO,
    carregandoCursos,
    catalogoDisponivel: cursos.length > 0,
    erroCursos,
  };
};
