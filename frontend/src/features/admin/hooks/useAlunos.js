import * as React from "react";
import { listarAlunos, listarCidades } from "../services/alunoService";
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
  const [cidades, setCidades] = React.useState([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);
  const requisicaoRef = React.useRef(0);
  const cidadesReqRef = React.useRef(0);

  const carregarAlunos = React.useCallback(
    async ({ silencioso = false } = {}) => {
      const requisicaoId = ++requisicaoRef.current;

      if (!silencioso) setCarregando(true);
      setErro(null);

      try {
        const res = await listarAlunos({
          nome: buscaDebounced,
          cursoId,
          cidade,
          status,
          pagina,
          limite,
        });

        if (requisicaoId !== requisicaoRef.current) return;

        setAlunos(res?.alunos ?? []);
        setTotal(res?.total ?? 0);
      } catch (err) {
        if (requisicaoId !== requisicaoRef.current) return;

        setAlunos([]);
        setTotal(0);
        setErro(err.message);
      } finally {
        if (!silencioso && requisicaoId === requisicaoRef.current) {
          setCarregando(false);
        }
      }
    },
    [buscaDebounced, cursoId, cidade, status, pagina, limite],
  );

  const carregarCidades = React.useCallback(async () => {
    const requisicaoId = ++cidadesReqRef.current;

    try {
      const res = await listarCidades({ status });
      if (requisicaoId !== cidadesReqRef.current) return;
      setCidades(res?.cidades ?? []);
    } catch {
      if (requisicaoId !== cidadesReqRef.current) return;
      setCidades([]);
    }
  }, [status]);

  React.useEffect(() => {
    void Promise.resolve().then(() => carregarAlunos());

    return () => {
      requisicaoRef.current += 1;
    };
  }, [carregarAlunos]);

  React.useEffect(() => {
    void Promise.resolve().then(() => carregarCidades());

    return () => {
      cidadesReqRef.current += 1;
    };
  }, [carregarCidades]);

  return {
    alunos,
    total,
    cidades,
    carregando,
    erro,
    recarregar: carregarAlunos,
    recarregarCidades: carregarCidades,
  };
};

export default useAlunos;
