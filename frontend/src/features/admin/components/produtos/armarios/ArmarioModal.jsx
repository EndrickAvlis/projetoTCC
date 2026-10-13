import * as React from "react";

import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import InputMoeda from "../../../../../components/ui/InputMoeda";
import Modal from "../../../../../components/ui/Modal";

const dadosIniciais = {
  preco: 0,
  quantidade: "",
};

const ArmarioModal = ({
  aberto,
  armario = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  const emEdicao = Boolean(armario);

  const [dados, setDados] = React.useState(dadosIniciais);
  const [erros, setErros] = React.useState({});

  React.useEffect(() => {
    if (aberto) {
      if (armario) {
        setDados({
          preco: armario.preco,
          quantidade: armario.quantidade,
        });
      } else {
        setDados(dadosIniciais);
      }
    }
    setErros({});
  }, [aberto, armario]);

  const atualizarCampo = (campo, value) => {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: value,
    }));

    setErros((errosAtuais) => ({
      ...errosAtuais,
      [campo]: "",
    }));
  };

  const validarArmarioForm = () => {
    const newErrors = {};
    const preco = Number(dados.preco);
    const quantidade = Number(dados.quantidade);

    if (!Number.isFinite(preco) || preco <= 0) {
      newErrors.preco = "Insira o preço.";
    }

    if (dados.quantidade === "") {
      newErrors.quantidade = "Insira a quantidade disponível.";
    } else if (!Number.isInteger(quantidade)) {
      newErrors.quantidade = "Informe uma quantidade inteira.";
    } else if (quantidade < 0) {
      newErrors.quantidade = "A quantidade deve ser maior ou igual a 0.";
    }

    setErros(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarArmarioForm()) return;
    onSalvar({
      preco: dados.preco,
      quantidade: Number(dados.quantidade),
    });
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={
        emEdicao ? "Editar configuração dos armários" : "Configurar armários"
      }
      largura="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {!emEdicao && (
          <p className="text-sm text-text-secondary">
            Informe o preço e a quantidade inicial para os armários.
          </p>
        )}
        <InputMoeda
          label="Preço"
          valor={dados.preco}
          onChange={(valor) => atualizarCampo("preco", valor)}
          error={erros.preco}
          disabled={salvando}
          required
          autoFocus
        />
        <Input
          label="Quantidade disponível"
          type="number"
          min="0"
          step="1"
          value={dados.quantidade}
          onChange={(evento) =>
            atualizarCampo("quantidade", evento.target.value)
          }
          error={erros.quantidade}
          disabled={salvando}
          required
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
            {emEdicao ? "Salvar alterações" : "Salvar configuração"}
          </Button>
        </footer>
      </form>
    </Modal>
  );
};
export default ArmarioModal;
