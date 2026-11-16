import * as React from "react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import { OPCOES_SEMESTRE } from "../../../../constants/cursoOptions";
import { bloquearTeclasNaoInteiras } from "../../../../utils/formHelpers";

const ArquivarCandidatosModalForm = ({
  onFechar,
  onConfirmar,
  salvando = false,
}) => {
  const [escopo, setEscopo] = React.useState("todos");
  const [anoProcesso, setAnoProcesso] = React.useState(() =>
    String(new Date().getFullYear()),
  );
  const [semestreProcesso, setSemestreProcesso] = React.useState(() =>
    new Date().getMonth() < 6 ? "1" : "2",
  );
  const [erroAno, setErroAno] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (escopo === "todos") {
      onConfirmar({});
      return;
    }

    const ano = Number(anoProcesso);
    if (!anoProcesso || !Number.isInteger(ano) || ano < 2000 || ano > 2100) {
      setErroAno("Informe um ano válido entre 2000 e 2100.");
      return;
    }

    onConfirmar({
      anoProcesso: ano,
      semestreProcesso: Number(semestreProcesso),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-4">
        <p className="text-text-secondary">
          Escolha se deseja arquivar todos os alunos candidatos ou apenas os de
          um processo seletivo específico.
        </p>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-text-primary">
            <input
              type="radio"
              name="escopoArquivamento"
              value="todos"
              checked={escopo === "todos"}
              onChange={(e) => {
                setEscopo(e.target.value);
                setErroAno("");
              }}
              disabled={salvando}
              className="accent-primary"
            />
            Todos os candidatos
          </label>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-text-primary">
            <input
              type="radio"
              name="escopoArquivamento"
              value="processo"
              checked={escopo === "processo"}
              onChange={(e) => setEscopo(e.target.value)}
              disabled={salvando}
              className="accent-primary"
            />
            Apenas de um processo seletivo específico
          </label>
        </div>

        {escopo === "processo" && (
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <Input
              type="number"
              label="Ano do processo"
              onKeyDown={bloquearTeclasNaoInteiras}
              value={anoProcesso}
              onChange={(e) => {
                setAnoProcesso(e.target.value);
                if (erroAno) setErroAno("");
              }}
              error={erroAno}
              disabled={salvando}
              min={2000}
              max={2100}
              size="md"
            />

            <Select
              label="Semestre"
              value={semestreProcesso}
              onChange={(e) => setSemestreProcesso(e.target.value)}
              options={OPCOES_SEMESTRE}
              disabled={salvando}
              size="md"
            />
          </div>
        )}
      </div>

      <footer className="flex justify-end gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="secondary"
          onClick={onFechar}
          disabled={salvando}
        >
          Cancelar
        </Button>

        <Button type="submit" variant="danger" loading={salvando}>
          Arquivar
        </Button>
      </footer>
    </form>
  );
};

const ArquivarCandidatosModal = ({
  aberto,
  onFechar,
  onConfirmar,
  salvando = false,
}) => {
  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo="Arquivar candidatos"
      largura="max-w-lg"
    >
      {aberto && (
        <ArquivarCandidatosModalForm
          onFechar={onFechar}
          onConfirmar={onConfirmar}
          salvando={salvando}
        />
      )}
    </Modal>
  );
};

export default ArquivarCandidatosModal;

