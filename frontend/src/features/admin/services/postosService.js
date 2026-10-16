import { requisitarApi } from "../../../services/apiClient";

export const dadosFila = () => 
  requisitarApi("/postos/filas");

export const dadosAtendimento = (params) => 
  requisitarApi("/postos/atendimento", { params });

export const dadosAuditoria = (params) => 
  requisitarApi("/postos/auditoria", { params });

export const transferirSenha = (id, posto) => 
  requisitarApi(`/postos/${id}/transferencia`, { method: "PATCH", body: { posto } });

export const cancelarSenha = (id) => 
  requisitarApi(`/postos/${id}/cancelamento`, { method: "PATCH" });
