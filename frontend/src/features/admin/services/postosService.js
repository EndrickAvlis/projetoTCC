import { requisitarApi } from "../../../services/apiClient";

export const obterResumoPostos = () => requisitarApi("/admin/postos");
