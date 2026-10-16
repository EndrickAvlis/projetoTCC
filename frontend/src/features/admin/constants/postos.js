export const OPCOES_TIPO_PERIODO = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "personalizado", label: "Personalizado" },
];


export const OPCOES_STATUS = [
  { valor: "", label: "Todas" },
  { valor: "finalizada", label: "Finalizadas" },
  { valor: "cancelada", label: "Canceladas" },
];

export const POSTOS = ["triagem", "apm", "docs"];

export const CORES_STATUS = {
  aguardando: "info",
  em_atendimento: "success",
  pendente: "warning",
  finalizada: "neutral",
  cancelada: "danger",
};

export const NOMES_DOCUMENTOS = {
  foto_3x4: "Foto 3x4",
  rg_cin: "RG / CIN",
  cpf_cin: "CPF / CIN",
  historico_ensino_fundamental: "Histórico Escolar",
  comprovante_residencia: "Comprovante de Residência",
  comprovante_escolaridade_publica: "Comprovante de Escola Pública",
};
