import * as React from "react";
import { listarUsuarios } from "../services/UsuariosService";
import { useDebounce } from "../../../hooks/useDebounce";

export const useUsuarios = ({ busca = "", tipo = "", status = "" } = {}) => {
  const buscaDebounced = useDebounce(busca);
  const [usuarios, setUsuarios] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);

  const carregarUsuarios = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const res = await listarUsuarios({
        busca: buscaDebounced,
        tipo,
        status,
      });

      setUsuarios(res?.usuarios ?? []);
      setTotal(res?.total ?? 0);
    } catch (error) {
      setUsuarios([]);
      setTotal(0);
      setErro(error.message);
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
    erro,
    recarregar: carregarUsuarios,
  };
};
