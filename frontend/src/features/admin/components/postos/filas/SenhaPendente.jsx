import * as React from "react";
import Badge from "../../../../../components/ui/Badge";
import { formatarSenha, formatarHora } from "../../../../../utils/formatters";
import { NOMES_DOCUMENTOS } from "../../../constants/postos";

const SenhaPendente = ({ senha, onSelecionar }) => {
  const totalDocs = senha.documentos.length;
  const tooltipDocs = `Documentos pendentes:\n• ${senha.documentos
    .map((doc) => NOMES_DOCUMENTOS[doc])
    .join("\n• ")}`;

  return (
    <button
      type="button"
      onClick={() => onSelecionar?.(senha)}
      title={tooltipDocs}
      className={`w-full p-1.5 rounded-lg border text-center transition-colors cursor-pointer hover:bg-surface-muted flex flex-col items-center justify-center gap-0.5 h-17 ${
        senha.prioritaria
          ? "border-status-warning border-2 bg-status-warning-bg/15"
          : "border-border bg-surface"
      }`}
    >
      <span className="text-sm font-bold text-text-primary tabular-nums leading-tight">
        {formatarSenha(senha.codigo)}
      </span>

      <Badge variant="warning" size="sm" className="text-[10px] px-1.5 py-0 leading-tight">
        {totalDocs} {totalDocs === 1 ? "doc" : "docs"}
      </Badge>

      <span className="text-[10px] text-text-secondary truncate">
        {formatarHora(senha.registradaEm)}
      </span>
    </button>
  );
};

export default SenhaPendente;
