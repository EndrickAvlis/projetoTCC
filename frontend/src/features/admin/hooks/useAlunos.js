import * as React from "react";
import { listarAlunos } from "../services/alunoService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useAlunos = ({
  busca = "",
  cursoId = "",
  cidade = "",
  status = "ATIVO",
  pagina = 1,
  limite = 10,
} = {}) => {
  const buscaDebounced = useDebounce(busca);
  const [alunos, setAlunos] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);

  const carregarAlunos = React.useCallback(async () => {
    setCarregando(true);

    try {
      const res = await listarAlunos({
        nome: buscaDebounced,
        cursoId,
        cidade,
        status,
        pagina,
        limite,
      });

      setAlunos(res?.alunos ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setAlunos([]);
      setTotal(0);
    } finally {
      setCarregando(false);
    }
  }, [buscaDebounced, cursoId, cidade, status, pagina, limite]);

  React.useEffect(() => {
    void Promise.resolve().then(carregarAlunos);
  }, [carregarAlunos]);

  return {
    alunos,
    total,
    carregando,
    recarregar: carregarAlunos,
  };
};

