import * as React from "react";
import { FiChevronDown, FiChevronUp, FiFileText } from "react-icons/fi";
import Button from "../../../../components/ui/button";
import { DOCUMENTOS_TRIAGEM } from "../../constants/triagem";

export const DocumentosPendentes = ({
  documentosSelecionados = [],
  onChange,
  onSelecionarDocumento,
  onSalvarPendencia,
  salvando = false,
  disabled = false,
  className = "",
}) => {
  const [aberto, setAberto] = React.useState(false);

  const totalSelecionados = documentosSelecionados.length;

  const handleSelecionar = (chave) => {
    if (onSelecionarDocumento) {
      onSelecionarDocumento(chave);
    }
    if (onChange) {
      const novos = documentosSelecionados.includes(chave)
        ? documentosSelecionados.filter((item) => item !== chave)
        : [...documentosSelecionados, chave];
      onChange(novos);
    }
  };

  return (
    <div
      className={`rounded-lg border border-border bg-surface overflow-hidden ${className}`}
    >
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        disabled={disabled}
        aria-expanded={aberto}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-surface-muted disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-text-secondary">
            <FiFileText className="h-5 w-5" />
          </span>
          <div>
            <div className="font-semibold text-text-primary text-base">
              Documentos pendentes
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              Indique se faltou algum documento obrigatório
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              totalSelecionados > 0
                ? "bg-status-warning-bg text-status-warning border-status-warning/30"
                : "bg-surface-muted text-text-secondary border-border"
            }`}
          >
            {totalSelecionados === 0
              ? "Nenhum selecionado"
              : `${totalSelecionados} ${
                  totalSelecionados === 1
                    ? "documento faltante"
                    : "documentos faltantes"
                }`}
          </span>
          <span className="text-text-secondary">
            {aberto ? (
              <FiChevronUp className="h-5 w-5" />
            ) : (
              <FiChevronDown className="h-5 w-5" />
            )}
          </span>
        </div>
      </button>

      {aberto && (
        <div className="p-5 border-t border-border bg-surface">
          <div className="mb-3.5">
            <div className="text-sm font-semibold text-text-primary">
              Selecione os documentos faltantes
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Ao salvar, a senha sairá do atendimento atual e ficará aguardando na lista de pendências.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            {DOCUMENTOS_TRIAGEM.map((doc) => {
              const selecionado = documentosSelecionados.includes(doc.value);

              return (
                <label
                  key={doc.value}
                  className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all text-sm select-none ${
                    selecionado
                      ? "border-status-warning bg-status-warning-bg/20 text-text-primary font-medium shadow-2xs"
                      : "border-border hover:bg-surface-muted/70 text-text-primary"
                  } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() => handleSelecionar(doc.value)}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-focus-ring cursor-pointer"
                  />
                  <span>{doc.label}</span>
                </label>
              );
            })}
          </div>

          {onSalvarPendencia && (
            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                type="button"
                variant="warning"
                size="md"
                onClick={onSalvarPendencia}
                disabled={disabled || totalSelecionados === 0 || salvando}
                loading={salvando}
              >
                Salvar pendência
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentosPendentes;
