import * as React from "react";
import { listarCursosAdmin } from "../services/cursosService";

export const useCursos = ({ busca = "", arquivado = false } = {}) => {
  const [cursos, setCursos] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarCursos = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const resposta = await listarCursosAdmin({
        busca,
        arquivado,
      });
      setCursos(resposta.cursos ?? []);
      setTotal(resposta.total ?? 0);
    } catch (error) {
      setCursos([]);
      setTotal(0);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [busca, arquivado]);

  React.useEffect(() => {
    carregarCursos();
  }, [carregarCursos]);

  return {
    cursos,
    total,
    carregando,
    erro,
    recarregar: carregarCursos,
  };
};
