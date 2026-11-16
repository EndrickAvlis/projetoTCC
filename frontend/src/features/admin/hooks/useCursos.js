import * as React from "react";
import { listarCursos } from "../services/cursoService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useCursos = ({ busca = "", arquivado = false } = {}) => {
  const buscaDebounced = useDebounce(busca);
  const [cursos, setCursos] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);
  const requisicaoRef = React.useRef(0);

  const carregarCursos = React.useCallback(
    async ({ silencioso = false } = {}) => {
      const requisicaoId = ++requisicaoRef.current;

      if (!silencioso) setCarregando(true);
      setErro(null);

      try {
        const res = await listarCursos({
          busca: buscaDebounced,
          arquivado,
        });

        if (requisicaoId !== requisicaoRef.current) return [];

        const lista = res.cursos ?? [];
        setCursos(lista);
        setTotal(res.total ?? 0);
        return lista;
      } catch (err) {
        if (requisicaoId !== requisicaoRef.current) return [];

        setCursos([]);
        setTotal(0);
        setErro(err.message);
        return [];
      } finally {
        if (!silencioso && requisicaoId === requisicaoRef.current) {
          setCarregando(false);
        }
      }
    },
    [buscaDebounced, arquivado],
  );

  React.useEffect(() => {
    void Promise.resolve().then(() => carregarCursos());

    return () => {
      requisicaoRef.current += 1;
    };
  }, [carregarCursos]);

  return {
    cursos,
    total,
    carregando,
    erro,
    recarregar: carregarCursos,
  };
};

export default useCursos;
