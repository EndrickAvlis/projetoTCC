import * as React from "react";
import Modal from "../../../../../components/ui/Modal";
import ConfirmarModal from "../../../../../components/ui/ConfirmarModal";
import { useCursos } from "../../../hooks/useCursos";
import * as AlunosService from "../../../services/alunoService";
import * as cursoService from "../../../services/cursoService";
import CursoModal from "../../cursos/CursoModal";
import UploadCsv from "./UploadCsv";
import MapeamentoCursos from "./MapeamentoCursos";
import ResultadoImportacao from "./ResultadoImportacao";
import { sugerirAssociacoesCursos } from "./importAluno";
import { useToast } from "../../../../../context/toastContext";

const ImportarAlunosModal = ({ aberto, onFechar, onSucesso }) => {
  const toast = useToast();
  const [etapa, setEtapa] = React.useState(1);
  const [anoProcesso, setAnoProcesso] = React.useState(
    new Date().getFullYear(),
  );
  const [semestreProcesso, setSemestreProcesso] = React.useState(() =>
    new Date().getMonth() < 6 ? "1" : "2",
  );
  const [arquivo, setArquivo] = React.useState(null);
  const [dadosArquivo, setDadosArquivo] = React.useState(null);
  const [gruposCursos, setGruposCursos] = React.useState([]);
  const [resultadoFinal, setResultadoFinal] = React.useState(null);
  const [carregando, setCarregando] = React.useState(false);
  const [cursoParaCriar, setCursoParaCriar] = React.useState(null);
  const [salvandoCurso, setSalvandoCurso] = React.useState(false);
  const [cursoParaDesarquivar, setCursoParaDesarquivar] = React.useState(null);
  const [desarquivandoCurso, setDesarquivandoCurso] = React.useState(false);

  const {
    cursos: cursosExistentes,
    recarregar: recarregarCursos,
    carregando: carregandoCursos,
  } = useCursos({ arquivado: "todos" });

  const handleRecarregarCursos = async ({ silencioso = false } = {}) => {
    const listaAtualizada = await recarregarCursos({ silencioso });
    if (listaAtualizada) {
      const idsDisponiveis = new Set(listaAtualizada.map((c) => String(c.id)));
      setGruposCursos((atuais) => {
        if (atuais.length === 0) return atuais;
        const limpos = atuais.map((g) =>
          g.idCurso && !idsDisponiveis.has(String(g.idCurso))
            ? { ...g, idCurso: "", tipoAssociacao: "PENDENTE" }
            : g,
        );
        return sugerirAssociacoesCursos(limpos, listaAtualizada);
      });
    }
  };

  const handleFechar = () => {
    if (carregando || salvandoCurso || desarquivandoCurso) return;
    setEtapa(1);
    setArquivo(null);
    setDadosArquivo(null);
    setGruposCursos([]);
    setResultadoFinal(null);
    setCursoParaCriar(null);
    setCursoParaDesarquivar(null);
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
          ? {
              ...item,
              idCurso,
              tipoAssociacao: idCurso ? "MANUAL" : "PENDENTE",
            }
          : item,
      ),
    );
  };

  const handleSalvarNovoCurso = async (dados) => {
    if (!cursoParaCriar) return;

    setSalvandoCurso(true);
    try {
      const res = await cursoService.criarCurso(dados);
      const novoCursoId = res?.curso?.id ? String(res.curso.id) : "";

      if (novoCursoId) {
        handleAtualizarAssociacao(cursoParaCriar.chave, novoCursoId);
      }

      await handleRecarregarCursos({ silencioso: true });
      toast.sucesso("Curso cadastrado e associado com sucesso.");
      setCursoParaCriar(null);
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvandoCurso(false);
    }
  };

  const handleDesarquivarCurso = async () => {
    if (!cursoParaDesarquivar) return;

    setDesarquivandoCurso(true);
    try {
      await cursoService.atualizarCurso(cursoParaDesarquivar.curso.id, {
        arquivado: false,
      });
      handleAtualizarAssociacao(
        cursoParaDesarquivar.chave,
        String(cursoParaDesarquivar.curso.id),
      );
      await handleRecarregarCursos({ silencioso: true });
      toast.sucesso(
        "Curso desarquivado e associado! Confira os períodos e vagas na tela de Cursos.",
      );
      setCursoParaDesarquivar(null);
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setDesarquivandoCurso(false);
    }
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
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleConcluir = () => {
    handleFechar();
    if (onSucesso) onSucesso();
  };

  return (
    <>
      <Modal
        aberto={aberto}
        onFechar={handleFechar}
        titulo="Importar Lista de Classificação"
        largura="max-w-4xl"
      >
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
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
          arquivo={arquivo}
          onAlterarArquivo={setArquivo}
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
            onCriarCurso={setCursoParaCriar}
            onDesarquivarCurso={setCursoParaDesarquivar}
            onVoltar={() => setEtapa(1)}
            onConfirmar={handleConfirmarImportacao}
            onRecarregarCursos={() => handleRecarregarCursos()}
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
              setArquivo(null);
              setDadosArquivo(null);
              setGruposCursos([]);
              setResultadoFinal(null);
            }}
          />
        )}
      </Modal>

      <CursoModal
        aberto={Boolean(cursoParaCriar)}
        dadosIniciaisCurso={
          cursoParaCriar
            ? { nome: cursoParaCriar.nomeCsv, periodos: cursoParaCriar.periodos }
            : null
        }
        onFechar={() => setCursoParaCriar(null)}
        onSalvar={handleSalvarNovoCurso}
        salvando={salvandoCurso}
      />

      <ConfirmarModal
        aberto={Boolean(cursoParaDesarquivar)}
        onFechar={() => !desarquivandoCurso && setCursoParaDesarquivar(null)}
        onConfirmar={handleDesarquivarCurso}
        titulo="Desarquivar curso"
        mensagem={
          cursoParaDesarquivar
            ? `Deseja desarquivar o curso ${cursoParaDesarquivar.curso.nome} e associá-lo à importação? Os períodos permanecerão fechados até que sejam reabertos em Cursos.`
            : ""
        }
        textoConfirmar="Desarquivar"
        variante="success"
        salvando={desarquivandoCurso}
      />
    </>
  );
};

export default ImportarAlunosModal;
