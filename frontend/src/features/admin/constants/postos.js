export const OPCOES_STATUS = [
  { valor: "", label: "Todas" },
  { valor: "finalizada", label: "Finalizadas" },
  { valor: "cancelada", label: "Canceladas" },
];

export const POSTOS = ["triagem", "apm", "docs"];

export const CORES_STATUS = {
  aguardando: "info",
  chamada: "primary",
  em_atendimento: "success",
  pendente: "warning",
  finalizada: "neutral",
  cancelada: "danger",
};

export const NOMES_DOCUMENTOS = {
  RG_CIN: "RG / CIN",
  CPF_CIN: "CPF / CIN",
  FOTO: "Foto 3x4",
  ESCOLARIDADE_PUBLICA: "Comprovante de Escola Pública",
  HISTORICO_ENSINO_FUNDAMENTAL: "Histórico do Ensino Fundamental",
};
