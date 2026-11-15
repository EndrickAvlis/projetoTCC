import * as React from "react";
import { listarUsuarios } from "../services/usuarioService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useUsuarios = ({ busca = "", tipo = "", status = "" } = {}) => {
  const buscaDebounced = useDebounce(busca, 300);
  const [usuarios, setUsuarios] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);
  const requisicaoIdRef = React.useRef(0);

  const carregarUsuarios = React.useCallback(async () => {
    const requisicaoId = ++requisicaoIdRef.current;
    setCarregando(true);
    setErro(null);

    try {
      const res = await listarUsuarios({
        busca: buscaDebounced,
        tipo,
        status,
      });

      if (requisicaoId !== requisicaoIdRef.current) return;
      setUsuarios(res.usuarios ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      if (requisicaoId !== requisicaoIdRef.current) return;
      setUsuarios([]);
      setTotal(0);
      setErro(err.message);
    } finally {
      if (requisicaoId === requisicaoIdRef.current) {
        setCarregando(false);
      }
    }
  }, [buscaDebounced, tipo, status]);

  React.useEffect(() => {
    void Promise.resolve().then(carregarUsuarios);
  }, [carregarUsuarios]);

  return {
    usuarios,
    total,
    carregando,
    erro,
    recarregar: carregarUsuarios,
  };
};

export default useUsuarios;
