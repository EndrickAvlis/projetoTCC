import { requisitarApi } from "../../../services/apiClient";

export const reiniciarSequenciaSenhas = () =>
  requisitarApi("/senhas/reiniciar-sequencia", {
    method: "POST",
  });

export { buscarUltimaSenha } from "../../postos/services/filaService";
