import * as React from "react";
import { listarUsuarios } from "../services/usuarioService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useUsuarios = ({ busca = "", tipo = "", status = "" } = {}) => {
  const buscaDebounced = useDebounce(busca, 300);
  const [usuarios, setUsuarios] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);

  const carregarUsuarios = React.useCallback(async () => {
    setCarregando(true);

    try {
      const res = await listarUsuarios({
        busca: buscaDebounced,
        tipo,
        status,
      });

      setUsuarios(res?.usuarios ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setUsuarios([]);
      setTotal(0);
    } finally {
      setCarregando(false);
    }
  }, [buscaDebounced, tipo, status]);

  React.useEffect(() => {
    void Promise.resolve().then(carregarUsuarios);
  }, [carregarUsuarios]);

  return {
    usuarios,
    total,
    carregando,
    recarregar: carregarUsuarios,
  };
};
