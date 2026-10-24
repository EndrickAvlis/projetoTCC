import { requisitarApi } from "../../../services/apiClient";

export const obterDashboard = (params) =>
  requisitarApi("/dashboard", { params });
