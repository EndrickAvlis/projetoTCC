import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiInfo,
  FiRotateCcw,
  FiSlash,
  FiUserCheck,
  FiUserMinus,
} from "react-icons/fi";
import Button from "../../../../../components/ui/Button";

const ResultadoImportacao = ({
  resultado,
  metricas,
  nomeArquivo,
  totalCursosAssociados = 0,
  anoProcesso,
  semestreProcesso,
  onConcluir,
  onReiniciar,
}) => {
  const totalImportados = resultado?.importados ?? 0;
  const totalDuplicados = resultado?.duplicados ?? 0;
  const totalTreineiros = metricas?.treineiros ?? 0;
  const totalInvalidos = metricas?.invalidos ?? 0;
  const totalLinhas = metricas?.totalLinhas ?? 0;
  const possuiNovosImportados = totalImportados > 0;

  const cardsResumo = [
    {
      chave: "importados",
      titulo: "Importados",
      valor: totalImportados,
      descricao: "Candidatos cadastrados",
      icone: FiUserCheck,
      cardClassName: "border-status-success/40 bg-status-success-bg/10",
      iconeClassName: "bg-status-success/20 text-status-success",
      valorClassName: "text-status-success",
    },
    {
      chave: "treineiros",
      titulo: "Treineiros",
      valor: totalTreineiros,
      descricao: "Ignorados conforme regra",
      icone: FiUserMinus,
      cardClassName: "border-border bg-surface",
      iconeClassName: "bg-primary/10 text-primary",
      valorClassName: "text-text-primary",
    },
    {
      chave: "duplicidades",
      titulo: "Duplicidades",
      valor: totalDuplicados,
      descricao: "Inscrições já existentes",
      icone: FiCopy,
      cardClassName: "border-border bg-surface",
      iconeClassName: "bg-status-warning/20 text-status-warning",
      valorClassName: "text-text-primary",
    },
    {
      chave: "invalidos",
      titulo: "Inválidos",
      valor: totalInvalidos,
      descricao: "Campos fora do padrão",
      icone: FiSlash,
      cardClassName: "border-border bg-surface",
      iconeClassName: "bg-surface-muted text-text-secondary",
      valorClassName: "text-text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-status-success/30 bg-status-success-bg/20 p-6 text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-status-success/15 text-status-success shadow-sm">
          <FiCheckCircle size={36} />
        </div>
        <h3 className="text-xl font-bold text-text-primary">
          {possuiNovosImportados
            ? "Importação Concluída com Sucesso!"
            : "Arquivo Processado com Sucesso!"}
        </h3>
        <p className="mt-1 max-w-md text-xs sm:text-sm text-text-secondary">
          {possuiNovosImportados ? (
            <>
              A lista de classificação do Processo Seletivo{" "}
              <strong className="text-text-primary">
                {anoProcesso}/{semestreProcesso}º Semestre
              </strong>{" "}
              foi processada e os candidatos foram registrados no sistema.
            </>
          ) : (
            <>
              A lista do Processo Seletivo{" "}
              <strong className="text-text-primary">
                {anoProcesso}/{semestreProcesso}º Semestre
              </strong>{" "}
              foi analisada, mas nenhum novo candidato foi adicionado pois todos
              os registros válidos já constavam no sistema.
            </>
          )}
        </p>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Resumo do Processamento
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cardsResumo.map((card) => {
            const Icone = card.icone;
            return (
              <div
                key={card.chave}
                className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${card.cardClassName}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">
                    {card.titulo}
                  </span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconeClassName}`}
                  >
                    <Icone size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <span
                    className={`text-2xl font-extrabold ${card.valorClassName}`}
                  >
                    {card.valor}
                  </span>
                  <p className="mt-0.5 text-[11px] text-text-secondary">
                    {card.descricao}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <FiInfo size={14} className="text-primary" />
          Detalhes da Importação
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-text-secondary">
          <div>
            Arquivo:{" "}
            <strong className="text-text-primary">{nomeArquivo}</strong>
          </div>
          <div>
            Total de linhas lidas:{" "}
            <strong className="text-text-primary">{totalLinhas}</strong>
          </div>
          <div>
            Cursos associados:{" "}
            <strong className="text-text-primary">
              {totalCursosAssociados}{" "}
              {totalCursosAssociados === 1 ? "curso" : "cursos"}
            </strong>
          </div>
        </div>
      </div>

      {possuiNovosImportados && (
        <div className="rounded-xl border border-status-info/30 bg-status-info-bg/15 p-4 text-xs text-status-info space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <FiCheck size={14} />
            Próximas etapas do fluxo de matrícula:
          </p>
          <p className="text-text-secondary leading-relaxed">
            Os candidatos importados foram criados com situação{" "}
            <strong>CANDIDATO</strong> e matrícula <strong>PENDENTE</strong>.
            Eles estarão visíveis na listagem de alunos e disponíveis para
            seleção e atendimento durante a <strong>Triagem</strong>, com
            ativação definitiva após conferência na área de{" "}
            <strong>Documentos (Docs)</strong>.
          </p>
        </div>
      )}

      <div className="sticky -bottom-6 -mx-6 bg-surface border-t border-border px-6 py-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 z-10">
        {onReiniciar && (
          <Button
            type="button"
            variant="secondary"
            onClick={onReiniciar}
            leftIcon={<FiRotateCcw size={16} />}
          >
            Importar Outro Arquivo
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          onClick={onConcluir}
          className="w-full sm:w-auto"
          rightIcon={<FiArrowRight size={18} />}
        >
          Concluir e Ver Alunos
        </Button>
      </div>
    </div>
  );
};

export default ResultadoImportacao;
