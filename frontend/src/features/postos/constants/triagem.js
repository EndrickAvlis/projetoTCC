export const ETAPA_TRIAGEM = "triagem";

export const LIMITE_BUSCA_ALUNOS = 10;

export const DEBOUNCE_BUSCA_ALUNOS_MS = 300;

export const DOCUMENTOS_TRIAGEM = [
  { value: "RG_CIN", label: "RG/CIN" },
  { value: "CPF_CIN", label: "CPF/CIN" },
  { value: "FOTO", label: "Foto" },
  { value: "ESCOLARIDADE_PUBLICA", label: "Escolaridade pública" },
  { value: "HISTORICO_ENSINO_FUNDAMENTAL", label: "Histórico do Fundamental"},
];

export const FASE_ATENDIMENTO = {
  SEM_SENHA: "sem_senha",
  CHAMADA: "chamada",
  INICIADA: "iniciada",
};

export const OPCOES_ESCOLARIDADE_PUBLICA = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
  { value: "null", label: "Não informado" },
];

export const OPCOES_ANO_ESCOLAR = [
  { value: "1", label: "1º Ano" },
  { value: "2", label: "2º Ano" },
  { value: "3", label: "3º Ano" },
];
