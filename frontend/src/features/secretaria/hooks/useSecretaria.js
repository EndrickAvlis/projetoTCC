import * as React from "react";
import { listarPendencias } from "../services/secretariaService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useSecretaria = ({
  busca = "",
  cursoId = "",
  pagina = 1,
  limite = 8,
} = {}) => {
  const buscaDebounced = useDebounce(busca, 300);

  const [compras, setCompras] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarPendencias = React.useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const res = await listarPendencias({
        busca: buscaDebounced.trim() || undefined,
        cursoId: cursoId || undefined,
        pagina,
        limite,
      });

      setCompras(res?.compras ?? []);
      setTotal(res?.total ?? 0);
    } catch (err) {
      setCompras([]);
      setTotal(0);
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [buscaDebounced, cursoId, pagina, limite]);

  React.useEffect(() => {
    void Promise.resolve().then(carregarPendencias);
  }, [carregarPendencias]);

  return {
    compras,
    total,
    carregando,
    erro,
    recarregar: carregarPendencias,
  };
};

export default useSecretaria;
