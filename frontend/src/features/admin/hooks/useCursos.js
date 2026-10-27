import * as React from "react";
import { listarCursos } from "../services/cursoService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useCursos = ({ busca = "", arquivado = false } = {}) => {
  const buscaDebounced = useDebounce(busca);
  const [cursos, setCursos] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);

  const carregarCursos = React.useCallback(async () => {
    setCarregando(true);

    try {
      const res = await listarCursos({
        busca: buscaDebounced,
        arquivado,
      });

      setCursos(res.cursos ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setCursos([]);
      setTotal(0);
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
    recarregar: carregarCursos,
  };
};
