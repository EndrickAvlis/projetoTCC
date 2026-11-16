import { FiFileText } from "react-icons/fi";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import CardRetratil from "../../../../components/ui/CardRetratil";
import { DOCUMENTOS_TRIAGEM } from "../../constants/triagem";

export const DocumentosPendentes = ({
  documentosSelecionados = [],
  onChange,
  onSalvarPendencia,
  podeSalvar = false,
  salvando = false,
  disabled = false,
  className = "",
}) => {
  const totalSelecionados = documentosSelecionados.length;

  const handleSelecionar = (chave) => {
    if (onChange) {
      const novos = documentosSelecionados.includes(chave)
        ? documentosSelecionados.filter((item) => item !== chave)
        : [...documentosSelecionados, chave];
      onChange(novos);
    }
  };

  return (
    <CardRetratil
      titulo="Documentos pendentes"
      subtitulo="Indique se faltou algum documento obrigatório"
      icone={FiFileText}
      abertoInicialmente={totalSelecionados > 0}
      badge={
        totalSelecionados > 0 ? (
          <Badge variant="warning" size="sm">
            {totalSelecionados}
          </Badge>
        ) : null
      }
      disabled={disabled}
      className={className}
    >
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
          {totalSelecionados > 0 && !podeSalvar ? (
            <span className="text-xs font-medium text-status-warning">
              Preencha os dados do candidato acima para salvar a pendência.
            </span>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="warning"
            size="md"
            onClick={onSalvarPendencia}
            disabled={disabled || !podeSalvar || salvando}
            loading={salvando}
          >
            Salvar pendência
          </Button>
        </div>
      )}
    </CardRetratil>
  );
};

export default DocumentosPendentes;