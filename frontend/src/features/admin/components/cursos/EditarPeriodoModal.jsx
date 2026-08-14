import * as React from "react";
import Alert from "../../../../components/ui/Alert";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import { PERIODOS_CURSO } from "../../../../constants/cursoOptions";

const EditarPeriodoModal = ({
  aberto,
  periodo,
  onFechar,
  onSalvar,
  salvando = false,
  erro = null,
}) => {
  const [dados, setDados] = React.useState({
    periodo: "",
    vagasTotais: "",
    matriculaAtiva: true,
  });
  const [erros, setErros] = React.useState({});

  React.useEffect(() => {
    if (!aberto || !periodo) {
      return;
    }

    setDados({
      periodo: periodo.periodo,
      vagasTotais: String(periodo.vagasTotais),
      matriculaAtiva: periodo.matriculaAtiva,
    });
    setErros({});
  }, [aberto, periodo]);

  const atualizarCampo = (campo, valor) => {
    setDados((dadosAtuais) => ({ ...dadosAtuais, [campo]: valor }));
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();

    const vagasTotais = Number(dados.vagasTotais);
    const novosErros = {};

    if (!dados.periodo) {
      novosErros.periodo = "Selecione um período.";
    }

    if (
      dados.vagasTotais === "" ||
      !Number.isInteger(vagasTotais) ||
      vagasTotais < 0
    ) {
      novosErros.vagasTotais =
        "Informe um número inteiro maior ou igual a zero.";
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      return;
    }

    onSalvar({
      ...dados,
      vagasTotais,
    });
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo="Editar período"
      largura="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {erro && <Alert type="error" message={erro} />}

        <Select
          label="Período"
          placeholder="Selecione o período"
          options={PERIODOS_CURSO}
          value={dados.periodo}
          onChange={(evento) => atualizarCampo("periodo", evento.target.value)}
          error={erros.periodo}
          required
        />

        <Input
          label="Vagas totais"
          type="number"
          min="0"
          step="1"
          value={dados.vagasTotais}
          onChange={(evento) => atualizarCampo("vagasTotais", evento.target.value)}
          error={erros.vagasTotais}
          required
        />

        <label className="flex cursor-pointer items-center gap-3 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={dados.matriculaAtiva}
            onChange={(evento) =>
              atualizarCampo("matriculaAtiva", evento.target.checked)
            }
          />
          Matrícula aberta para este período
        </label>

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
            Salvar alterações
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default EditarPeriodoModal;
