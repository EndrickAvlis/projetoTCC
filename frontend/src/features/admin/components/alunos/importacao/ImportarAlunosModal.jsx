import * as React from "react";
import Modal from "../../../../../components/ui/Modal";
import { useCursos } from "../../../hooks/useCursos";
import * as AlunosService from "../../../services/alunoService";
import UploadCsv from "./UploadCsv";
import MapeamentoCursos from "./MapeamentoCursos";
import ResultadoImportacao from "./ResultadoImportacao";

const ImportarAlunosModal = ({ aberto, onFechar, onSucesso }) => {
  const [etapa, setEtapa] = React.useState(1);
  const [anoProcesso, setAnoProcesso] = React.useState(
    new Date().getFullYear(),
  );
  const [semestreProcesso, setSemestreProcesso] = React.useState("1");
  const [dadosArquivo, setDadosArquivo] = React.useState(null);
  const [gruposCursos, setGruposCursos] = React.useState([]);
  const [resultadoFinal, setResultadoFinal] = React.useState(null);
  const [carregando, setCarregando] = React.useState(false);

  const {
    cursos: cursosExistentes,
    recarregar: recarregarCursos,
    carregando: carregandoCursos,
  } = useCursos({ arquivado: false });

  const handleFechar = () => {
    setEtapa(1);
    setDadosArquivo(null);
    setGruposCursos([]);
    setResultadoFinal(null);
    onFechar();
  };

  const handleArquivoAnalisado = (dados) => {
    setDadosArquivo(dados);
    setGruposCursos(dados.gruposCursos);
  };

  const handleAtualizarAssociacao = (chave, idCurso) => {
    setGruposCursos((atuais) =>
      atuais.map((item) =>
        item.chave === chave
          ? { ...item, idCurso, tipoAssociacao: "MANUAL" }
          : item,
      ),
    );
  };

  const handleConfirmarImportacao = async () => {
    setCarregando(true);
    try {
      const mapaCursos = Object.fromEntries(
        gruposCursos.map((g) => [g.chave, Number(g.idCurso)]),
      );

      const candidatos = dadosArquivo.candidatosValidos.map((c) => ({
        nome: c.nomeAluno,
        escolaridadePublica: c.escolaridadePublica,
        cidade: c.cidadeAluno,
        sexo: c.sexoAluno,
        classificacao: c.classificacao,
        periodo: c.periodo,
        cursoId: mapaCursos[c.chaveCurso],
      }));

      const resposta = await AlunosService.importarAlunos({
        anoProcesso: Number(anoProcesso),
        semestreProcesso: Number(semestreProcesso),
        candidatos,
      });
      setResultadoFinal(resposta);
      setEtapa(3);
    } catch {
      // Toast global do apiClient já notifica o usuário
    } finally {
      setCarregando(false);
    }
  };

  const handleConcluir = () => {
    handleFechar();
    if (onSucesso) onSucesso();
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={handleFechar}
      titulo="Importar Lista de Classificação"
      largura="max-w-3xl"
    >
      <div className="sticky top-0 z-10 mb-6 flex items-center justify-between border-b border-border bg-surface pb-4 pt-1">
        {[
          { num: 1, label: "Selecionar Arquivo" },
          { num: 2, label: "Mapear Cursos" },
          { num: 3, label: "Conclusão" },
        ].map((step, idx) => {
          const ativo = etapa === step.num;
          const concluido = etapa > step.num;
          return (
            <div key={step.num} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  concluido
                    ? "bg-status-success text-text-inverse"
                    : ativo
                      ? "bg-primary text-text-inverse"
                      : "bg-surface-muted text-text-secondary border border-border"
                }`}
              >
                {concluido ? "✓" : step.num}
              </div>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  ativo
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary"
                }`}
              >
                {step.label}
              </span>
              {idx < 2 && (
                <div className="mx-2 hidden h-px w-8 bg-border sm:block" />
              )}
            </div>
          );
        })}
      </div>

      {etapa === 1 && (
        <UploadCsv
          anoProcesso={anoProcesso}
          onAlterarAno={setAnoProcesso}
          semestreProcesso={semestreProcesso}
          onAlterarSemestre={setSemestreProcesso}
          cursosExistentes={cursosExistentes}
          onArquivoAnalisado={handleArquivoAnalisado}
          onAvancar={() => setEtapa(2)}
          onCancelar={handleFechar}
        />
      )}

      {etapa === 2 && (
        <MapeamentoCursos
          gruposCursos={gruposCursos}
          cursosExistentes={cursosExistentes}
          onAtualizarAssociacao={handleAtualizarAssociacao}
          onVoltar={() => setEtapa(1)}
          onConfirmar={handleConfirmarImportacao}
          onRecarregarCursos={recarregarCursos}
          carregandoCursos={carregandoCursos}
          carregando={carregando}
        />
      )}

      {etapa === 3 && (
        <ResultadoImportacao
          resultado={resultadoFinal}
          metricas={dadosArquivo?.metricas}
          nomeArquivo={dadosArquivo?.nomeArquivo}
          totalCursosAssociados={gruposCursos.length}
          anoProcesso={anoProcesso}
          semestreProcesso={semestreProcesso}
          onConcluir={handleConcluir}
          onReiniciar={() => {
            setEtapa(1);
            setDadosArquivo(null);
            setGruposCursos([]);
            setResultadoFinal(null);
          }}
        />
      )}
    </Modal>
  );
};

export default ImportarAlunosModal;
