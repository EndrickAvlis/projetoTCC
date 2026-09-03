import * as React from "react";
import * as FiIcons from "react-icons/fi";
import Button from "../../../../../components/ui/button";

const ResultadoImportacao = ({
  resultado,
  dadosArquivo,
  anoProcesso,
  semestreProcesso,
  gruposCursos = [],
  onConcluir,
  onReiniciar,
}) => {
  const totalImportados = resultado?.importados ?? 0;
  const totalTreineiros = resultado?.treineiros ?? 0;
  const totalDuplicados = resultado?.duplicados ?? 0;
  const totalInvalidos = resultado?.invalidos ?? 0;
  const totalLinhas = dadosArquivo?.resultado?.totalLinhas ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-status-success/30 bg-status-success-bg/20 p-6 text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-status-success/15 text-status-success shadow-sm">
          <FiIcons.FiCheckCircle size={36} />
        </div>
        <h3 className="text-xl font-bold text-text-primary">
          Importação Concluída com Sucesso!
        </h3>
        <p className="mt-1 max-w-md text-xs sm:text-sm text-text-secondary">
          A lista de classificação do Processo Seletivo{" "}
          <strong className="text-text-primary">
            {anoProcesso}/{semestreProcesso}º Semestre
          </strong>{" "}
          foi processada e os candidatos foram registrados no sistema.
        </p>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Resumo do Processamento
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between rounded-xl border border-status-success/40 bg-status-success-bg/10 p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Importados
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-success/20 text-status-success">
                <FiIcons.FiUserCheck size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-status-success">
                {totalImportados}
              </span>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                Candidatos cadastrados
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Treineiros
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FiIcons.FiUserMinus size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-text-primary">
                {totalTreineiros}
              </span>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                Ignorados conforme regra
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Duplicidades
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-warning/20 text-status-warning">
                <FiIcons.FiCopy size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-text-primary">
                {totalDuplicados}
              </span>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                Inscrições já existentes
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Inválidos
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-text-secondary">
                <FiIcons.FiSlash size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-text-primary">
                {totalInvalidos}
              </span>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                Campos fora do padrão
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <FiIcons.FiInfo size={14} className="text-primary" />
          Detalhes da Importação
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-text-secondary">
          <div>
            Arquivo:{" "}
            <strong className="text-text-primary">
              {dadosArquivo?.nome}
            </strong>
          </div>
          <div>
            Total de linhas lidas:{" "}
            <strong className="text-text-primary">{totalLinhas}</strong>
          </div>
          <div>
            Cursos associados:{" "}
            <strong className="text-text-primary">
              {gruposCursos.length} cursos
            </strong>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-status-info/30 bg-status-info-bg/15 p-4 text-xs text-status-info space-y-1">
        <p className="font-semibold flex items-center gap-1.5">
          <FiIcons.FiCheck size={14} />
          Próximas etapas do fluxo de matrícula:
        </p>
        <p className="text-text-secondary leading-relaxed">
          Os candidatos importados foram criados com situação{" "}
          <strong>CANDIDATO</strong> e matrícula <strong>PENDENTE</strong>. Eles
          estarão visíveis na listagem de alunos e disponíveis para seleção e
          atendimento durante a <strong>Triagem</strong>, com ativação
          definitiva após conferência na área de{" "}
          <strong>Documentos (Docs)</strong>.
        </p>
      </div>

      <div className="sticky -bottom-6 -mx-6 bg-surface border-t border-border px-6 py-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 z-10">
        {onReiniciar && (
          <Button
            type="button"
            variant="secondary"
            onClick={onReiniciar}
            leftIcon={<FiIcons.FiRotateCcw size={16} />}
          >
            Importar Outro Arquivo
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          onClick={onConcluir}
          className="w-full sm:w-auto"
          rightIcon={<FiIcons.FiArrowRight size={18} />}
        >
          Concluir e Ver Alunos
        </Button>
      </div>
    </div>
  );
};

export default ResultadoImportacao;
