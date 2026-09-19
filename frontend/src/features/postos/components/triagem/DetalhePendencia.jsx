import { FiAlertCircle, FiClock, FiFileText } from "react-icons/fi";
import Button from "../../../../components/ui/button";
import { DOCUMENTOS_TRIAGEM } from "../../constants/triagem";
import { formatarHora, formatarSenha } from "../../../../utils/formatters";

const obterRotuloDocumento = (chave) => {
  const doc = DOCUMENTOS_TRIAGEM.find((d) => d.value === chave);
  return doc ? doc.label : chave;
};

export const DetalhePendencia = ({
  pendencia = null,
  onRetomar,
  temSenhaAtual = false,
  retomando = false,
  className = "",
}) => {
  if (!pendencia) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-64 rounded-lg border border-dashed border-border bg-surface-muted/40 p-6 text-center ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border text-text-secondary mb-3 shadow-2xs">
          <FiFileText className="h-6 w-6" />
        </div>
        <div className="font-semibold text-text-primary text-base">
          Selecione uma senha
        </div>
        <p className="text-xs text-text-secondary mt-1 max-w-xs">
          Os dados do aluno e os documentos faltantes serão exibidos aqui para conferência.
        </p>
      </div>
    );
  }

  const { senha, aluno, matricula, documentos = [], registradaEm } = pendencia;
  const prioritaria = senha.tipoSenha;

  return (
    <div
      className={`flex flex-col rounded-lg border border-border bg-surface p-5 gap-4.5 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-border">
        <div>
          <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
            Senha pendente
          </span>
          <div className="font-bold text-primary text-2xl tracking-tight leading-tight">
            {formatarSenha(senha.codigo)}
          </div>
        </div>

        {prioritaria && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-status-warning-bg text-status-warning border border-status-warning/30">
            Prioritária
          </span>
        )}
      </div>

      <div className="rounded-md border border-border/70 bg-surface-muted p-3.5 flex flex-col gap-2">
        <div>
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Aluno
          </span>
          <div className="font-semibold text-text-primary text-base mt-0.5">
            {aluno.nome}
          </div>
        </div>

        {matricula && (
          <div className="pt-1.5 border-t border-border/50">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Curso / Matrícula
            </span>
            <div className="text-sm text-text-primary mt-0.5">
              {matricula.curso}
              {matricula.periodo && ` — ${matricula.periodo}`}
              {matricula.anoEscolar && ` (${matricula.anoEscolar}º ano)`}
            </div>
          </div>
        )}

        {registradaEm && (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary pt-1">
            <FiClock className="h-3.5 w-3.5 text-text-secondary" />
            <span>Pendente desde: {formatarHora(registradaEm)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
            Documentos faltantes
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-status-danger-bg text-status-danger border border-status-danger/30">
            {documentos.length}
          </span>
        </div>

        <ul className="flex flex-col gap-1.5">
          {documentos.map((chave) => (
            <li
              key={chave}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-status-danger-bg/70 text-status-danger text-xs font-semibold border border-status-danger/20"
            >
              <FiAlertCircle className="h-4 w-4 shrink-0" />
              <span>{obterRotuloDocumento(chave)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 border-t border-border flex flex-col gap-2">
        {onRetomar && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => onRetomar(senha.id)}
            disabled={temSenhaAtual || retomando}
            loading={retomando}
            className="w-full justify-center"
          >
            Retomar atendimento
          </Button>
        )}

        {temSenhaAtual && (
          <p className="text-xs text-center text-status-danger font-medium">
            Finalize o atendimento atual para retomar esta pendência.
          </p>
        )}
      </div>
    </div>
  );
};

export default DetalhePendencia;
