import * as React from "react";
import * as FiIcons from "react-icons/fi";
import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/button";
import Input from "../../../../../components/ui/input";
import Select from "../../../../../components/ui/Select";
import {
  decodificarCsv,
  parsearCsv,
  analisarCsvAlunos,
} from "../../../services/ImportAlunosService";

const OPCOES_SEMESTRE = [
  { value: "1", label: "1º Semestre" },
  { value: "2", label: "2º Semestre" },
];

const formatarTamanhoArquivo = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const tamanhos = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${tamanhos[i]}`;
};

const UploadCsv = ({
  anoProcesso,
  onAlterarAno,
  semestreProcesso,
  onAlterarSemestre,
  cursosExistentes = [],
  onArquivoAnalisado,
  onAvancar,
  onCancelar,
}) => {
  const [arquivo, setArquivo] = React.useState(null);
  const [arrastando, setArrastando] = React.useState(false);
  const [analisando, setAnalisando] = React.useState(false);
  const [erro, setErro] = React.useState(null);
  const inputArquivoRef = React.useRef(null);

  const validarArquivo = (arquivoSelecionado) => {
    if (!arquivoSelecionado) return false;

    const nome = arquivoSelecionado.name.toLowerCase();
    if (!nome.endsWith(".csv")) {
      setErro("Formato inválido. Por favor, selecione um arquivo com extensão .csv");
      return false;
    }

    if (arquivoSelecionado.size === 0) {
      setErro("O arquivo selecionado está vazio.");
      return false;
    }

    setErro(null);
    return true;
  };

  const handleArquivoSelecionado = (novoArquivo) => {
    if (validarArquivo(novoArquivo)) {
      setArquivo(novoArquivo);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastando(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleArquivoSelecionado(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastando(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setArrastando(false);
  };

  const handleRemoverArquivo = () => {
    setArquivo(null);
    setErro(null);
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = "";
    }
  };

  const handleProcessarArquivo = async () => {
    if (!anoProcesso || Number(anoProcesso) < 2000 || Number(anoProcesso) > 2100) {
      setErro("Informe um ano válido para o processo seletivo (ex: 2026).");
      return;
    }

    if (!semestreProcesso) {
      setErro("Selecione o semestre do processo seletivo.");
      return;
    }

    if (!arquivo) {
      setErro("Selecione um arquivo CSV para prosseguir.");
      return;
    }

    setAnalisando(true);
    setErro(null);

    try {
      const arrayBuffer = await arquivo.arrayBuffer();
      const texto = decodificarCsv(arrayBuffer);

      const { registros } = parsearCsv(texto, ";");

      const resultado = analisarCsvAlunos(registros, cursosExistentes);

      if (resultado.candidatosValidos.length === 0) {
        if (resultado.metricas.treineiros > 0) {
          throw new Error(
            `Nenhum candidato elegível encontrado no arquivo. Todos os ${resultado.metricas.treineiros} registros são treineiros.`
          );
        }
        throw new Error(
          "Nenhum candidato válido foi encontrado no arquivo CSV. Verifique o layout dos dados."
        );
      }

      if (onArquivoAnalisado) {
        onArquivoAnalisado({
          arquivo: {
            nome: arquivo.name,
            tamanho: arquivo.size,
          },
          resultado,
        });
      }

      if (onAvancar) {
        onAvancar();
      }
    } catch (err) {
      setErro(err.message || "Erro ao processar o arquivo CSV. Verifique a estrutura e os dados.");
    } finally {
      setAnalisando(false);
    }
  };

  return (
    <div className="space-y-6">
      {erro && (
        <Alert
          type="error"
          message={erro}
          onClose={() => setErro(null)}
        />
      )}

      <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted/50 p-4 text-sm text-text-secondary">
        <FiIcons.FiInfo className="mt-0.5 shrink-0 text-primary" size={18} />
        <div className="space-y-1">
          <p className="font-medium text-text-primary">
            Importação da Lista de Classificação do Vestibulinho
          </p>
          <p>
            O arquivo CSV deve ser delimitado por ponto e vírgula (<code>;</code>) e conter os
            cabeçalhos obrigatórios. Candidatos marcados como <strong>TREINEIRO</strong> e
            colunas desnecessárias serão desconsiderados automaticamente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Ano do Processo Seletivo"
          type="number"
          required
          min="2000"
          max="2100"
          value={anoProcesso}
          onChange={(e) => onAlterarAno(e.target.value)}
          placeholder="Digite o ano..."
        />

        <Select
          label="Semestre do Processo Seletivo"
          required
          value={String(semestreProcesso)}
          onChange={(e) => onAlterarSemestre(e.target.value)}
          options={OPCOES_SEMESTRE}
          placeholder="Selecione o semestre..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Arquivo CSV da Classificação <span className="text-status-danger">*</span>
        </label>

        <input
          ref={inputArquivoRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleArquivoSelecionado(e.target.files[0]);
            }
          }}
        />

        {!arquivo ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputArquivoRef.current?.click()}
            className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              arrastando
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/60 hover:bg-surface-muted/40"
            }`}
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <FiIcons.FiUploadCloud size={28} />
            </div>
            <p className="text-sm font-semibold text-text-primary">
              Clique para selecionar ou arraste o arquivo CSV aqui
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Codificações aceitas: UTF-8 e Windows-1252 (ANSI) • Delimitador: ponto e vírgula (;)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 p-4 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FiIcons.FiFileText size={24} />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">{arquivo.name}</p>
                <p className="text-xs text-text-secondary">
                  {formatarTamanhoArquivo(arquivo.size)} • Pronto para análise
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemoverArquivo}
              className="text-status-danger hover:bg-status-danger-bg hover:text-status-danger"
              leftIcon={<FiIcons.FiTrash2 size={16} />}
            >
              Remover
            </Button>
          </div>
        )}
      </div>

      <div className="sticky -bottom-6 -mx-6 bg-surface border-t border-border px-6 py-4 flex items-center justify-end gap-3 z-10">
        {onCancelar && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelar}
            disabled={analisando}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          onClick={handleProcessarArquivo}
          disabled={!arquivo || analisando}
          loading={analisando}
          rightIcon={<FiIcons.FiArrowRight size={18} />}
        >
          {analisando ? "Analisando..." : "Analisar Arquivo"}
        </Button>
      </div>
    </div>
  );
};

export default UploadCsv;
