import * as React from "react";
import { listarCursosAdmin } from "../services/cursoService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useCursos = ({ busca = "", arquivado = false } = {}) => {
  const buscaDebounced = useDebounce(busca);
  const [cursos, setCursos] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarCursos = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const res = await listarCursosAdmin({
        busca: buscaDebounced,
        arquivado,
      });

      setCursos(res.cursos ?? []);
      setTotal(res.total ?? 0);
    } catch (error) {
      setCursos([]);
      setTotal(0);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [buscaDebounced, arquivado]);

  React.useEffect(() => {
    void Promise.resolve().then(carregarCursos);
  }, [carregarCursos]);

  return {
    cursos,
    total,
    carregando,
    erro,
    recarregar: carregarCursos,
  };
};
