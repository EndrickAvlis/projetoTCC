import * as React from "react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import Toggle from "../../../../components/ui/Toggle";
import {
  PERIODOS_CURSO,
  VAGAS_MAXIMAS_PERIODO,
} from "../../../../constants/cursoOptions";
import {
  bloquearTeclasNaoInteiras,
  validarQuantidadeInteira,
} from "../../../../utils/formHelpers";
import { formatarPeriodo } from "../../../../utils/formatters";

const PeriodoModalForm = ({
  periodo = null,
  periodoInicial = "",
  periodosExistentes = [],
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  const emEdicao = Boolean(periodo);
  const periodosExistentesSet = new Set(periodosExistentes);

  const [periodoSelecionado, setPeriodoSelecionado] =
    React.useState(periodoInicial);
  const [vagasTotais, setVagasTotais] = React.useState(() =>
    periodo?.vagasTotais != null ? String(periodo.vagasTotais) : "",
  );
  const [matriculaAtiva, setMatriculaAtiva] = React.useState(
    () => periodo?.matriculaAtiva ?? true,
  );
  const [erros, setErros] = React.useState({});

  const limparErro = (campo) => {
    setErros((prev) => (prev[campo] ? { ...prev, [campo]: "" } : prev));
  };

  const validarPeriodoForm = () => {
    const novosErros = {};

    if (!emEdicao) {
      if (!periodoSelecionado) {
        novosErros.periodo = "Selecione um período.";
      } else if (periodosExistentesSet.has(periodoSelecionado)) {
        novosErros.periodo = "Este período já existe para este curso.";
      }
    }

    const erroVagas = validarQuantidadeInteira(vagasTotais, {
      mensagemVazio: "Informe o total de vagas.",
      minimo: 1,
      mensagemMinimo: "Informe ao menos 1 vaga.",
      maximo: VAGAS_MAXIMAS_PERIODO,
      mensagemMaximo: "A quantidade máxima permitida é 9.999 vagas.",
    });
    if (erroVagas) {
      novosErros.vagasTotais = erroVagas;
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarPeriodoForm()) return;

    if (emEdicao) {
      onSalvar({
        vagasTotais: Number(vagasTotais),
        matriculaAtiva,
      });
      return;
    }

    onSalvar({
      periodo: periodoSelecionado,
      vagasTotais: Number(vagasTotais),
      matriculaAtiva,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {!emEdicao && (
        <Select
          label="Período"
          placeholder="Selecione o período"
          options={PERIODOS_CURSO.map((op) => ({
            ...op,
            disabled: periodosExistentesSet.has(op.value),
          }))}
          value={periodoSelecionado}
          onChange={(e) => {
            setPeriodoSelecionado(e.target.value);
            limparErro("periodo");
          }}
          error={erros.periodo}
          disabled={salvando}
          autoFocus
          required
        />
      )}

      <Input
        label="Vagas totais"
        type="number"
        min="1"
        max={VAGAS_MAXIMAS_PERIODO}
        step="1"
        placeholder="Ex.: 40"
        onKeyDown={bloquearTeclasNaoInteiras}
        value={vagasTotais}
        onChange={(e) => {
          setVagasTotais(e.target.value);
          limparErro("vagasTotais");
        }}
        error={erros.vagasTotais}
        disabled={salvando}
        autoFocus={emEdicao}
        required
      />

      <Toggle
        size="sm"
        checked={matriculaAtiva}
        onChange={setMatriculaAtiva}
        label="Matrícula aberta para este período"
        disabled={salvando}
      />

      <footer className="flex justify-end gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="secondary"
          onClick={onFechar}
          disabled={salvando}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={salvando}>
          {emEdicao ? "Salvar alterações" : "Adicionar período"}
        </Button>
      </footer>
    </form>
  );
};

const PeriodoModal = ({
  aberto,
  periodo = null,
  periodoInicial = "",
  periodosExistentes = [],
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  const nomePeriodo = periodo
    ? formatarPeriodo(periodo.periodo) || periodo.periodo
    : "";

  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={periodo ? `Editar período — ${nomePeriodo}` : "Adicionar período"}
      largura="max-w-lg"
    >
      {aberto && (
        <PeriodoModalForm
          key={periodo ? `edit-${periodo.id}` : `new-${periodoInicial}`}
          periodo={periodo}
          periodoInicial={periodoInicial}
          periodosExistentes={periodosExistentes}
          onFechar={onFechar}
          onSalvar={onSalvar}
          salvando={salvando}
        />
      )}
    </Modal>
  );
};

export default PeriodoModal;
