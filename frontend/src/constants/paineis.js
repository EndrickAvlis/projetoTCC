export const POSTOS_PAINEL = ["triagem", "apm", "docs"];

export const ROTULOS_POSTO = {
  triagem: "TRIAGEM",
  apm: "APM",
  docs: "DOCUMENTOS",
};

export const TEMAS_PAINEL = {
  padrao: {
    id: "geral",
    titulo: "GERAL",
    rota: "/painel",
    senhaExemplo: "A001",
    fundo: "bg-primary",
    borda: "border-surface/15",
    container: "bg-surface/10",
    cardInterno: "bg-primary-active/45",
    destaque: "text-primary-border",
    destaqueCard: "border-focus-ring ring-4 ring-focus-ring/25",
    pillDestaque: "bg-primary-border text-primary",
    barra: "bg-focus-ring",
    botao:
      "border-primary text-primary hover:bg-primary hover:text-text-inverse",
  },
  triagem: {
    id: "triagem",
    titulo: "TRIAGEM",
    rota: "/painel/triagem",
    senhaExemplo: "A001",
    fundo: "bg-triagem-dark",
    borda: "border-triagem-border/25",
    container: "bg-triagem/15",
    cardInterno: "bg-triagem-dark/80",
    destaque: "text-triagem-border",
    destaqueCard: "border-triagem-border ring-4 ring-triagem-border/25",
    pillDestaque: "bg-triagem-border text-triagem-dark",
    barra: "bg-triagem-border",
    botao:
      "border-triagem text-triagem-text hover:bg-triagem hover:text-text-inverse",
  },
  apm: {
    id: "apm",
    titulo: "APM",
    rota: "/painel/apm",
    senhaExemplo: "A002",
    fundo: "bg-apm-dark",
    borda: "border-apm-border/25",
    container: "bg-apm/15",
    cardInterno: "bg-apm-dark/80",
    destaque: "text-apm-border",
    destaqueCard: "border-apm-border ring-4 ring-apm-border/25",
    pillDestaque: "bg-apm-border text-apm-dark",
    barra: "bg-apm-border",
    botao: "border-apm text-apm-text hover:bg-apm hover:text-text-inverse",
  },
  docs: {
    id: "docs",
    titulo: "DOCUMENTOS",
    rota: "/painel/docs",
    senhaExemplo: "A003",
    fundo: "bg-docs-dark",
    borda: "border-docs-border/25",
    container: "bg-docs/15",
    cardInterno: "bg-docs-dark/80",
    destaque: "text-docs-border",
    destaqueCard: "border-docs-border ring-4 ring-docs-border/25",
    pillDestaque: "bg-docs-border text-docs-dark",
    barra: "bg-docs-border",
    botao: "border-docs text-docs-text hover:bg-docs hover:text-text-inverse",
  },
};

export const LISTA_PAINEIS = [
  TEMAS_PAINEL.padrao,
  TEMAS_PAINEL.triagem,
  TEMAS_PAINEL.apm,
  TEMAS_PAINEL.docs,
];
