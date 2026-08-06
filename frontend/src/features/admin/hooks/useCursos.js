import { useCallback, useEffect, useState } from "react";
import { listarCursosAdmin } from "../services/cursosService";

export const useCursos = ({ busca = "", arquivado = false } = {}) => {
  const [cursos, setCursos] = useState([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarCursos = useCallback(async () => {
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

  useEffect(() => {
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
