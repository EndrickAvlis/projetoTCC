import * as React from "react";

import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import InputMoeda from "../../../../../components/ui/InputMoeda";
import Modal from "../../../../../components/ui/Modal";

const dadosIniciais = {
  nome: "",
  preco: 0,
  quantidade: "",
};

const UniformeModal = ({
  aberto,
  uniforme = null,
  onFechar,
  onSalvar,
  salvando = false,
  erro = null,
}) => {
  const emEdicao = Boolean(uniforme);

  const [dados, setDados] = React.useState(dadosIniciais);
  const [erros, setErros] = React.useState({});

  React.useEffect(() => {
    if (aberto) {
      if (uniforme) {
        setDados({
          nome: dados.nome,
          preco: dados.preco,
          quantidade: dados.quantidade,
        });
      } else {
        setDados(dadosIniciais);
      }
    }
    setErros({});
  }, [aberto, uniforme]);

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

  const validarUniformeForm = () => {
    const newErrors = {};
    const nome = dados.nome.trim();
    const preco = Number(dados.preco);
    const quantidade = Number(dados.quantidade);
    if (!nome) {
      newErrors.nome = "Informe o tamanho do uniforme.";
    } else if (nome.length > 50) {
      newErrors.nome = "O tamanho deve ter no máximo 50 caracteres.";
    }
    if (!Number.isFinite(preco) || preco <= 0) {
      newErrors.preco = "Informe um preço maior que zero.";
    }
    // Quantidade inicial é obrigatória apenas ao criar
    if (!emEdicao) {
      if (
        dados.quantidade === "" ||
        !Number.isInteger(quantidade) ||
        quantidade < 0
      ) {
        newErrors.quantidade =
          "Informe uma quantidade inteira maior ou igual a zero.";
      }
    }
    setErros(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarUniformeForm) return;
    if (emEdicao) {
      onSalvar({
        nome: dados.nome,
        preco: dados.preco,
      });
    } else {
      onSalvar({
        nome: dados.nome,
        preco: dados.preco,
        quantidade: dados.quantidade,
      });
    }
    // onSalvar({
    //   nome: dados.nome,
    //   preco: dados.preco,
    //   ...(!emEdicao && { quantidade: dados.quantidade }),
    // });
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={emEdicao ? "Editar uniforme" : "Adicionar uniforme"}
      largura="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {erro && <Alert type="error" message={erro} />}
        <Input
          label="Tamanho"
          value={dados.nome}
          onChange={(evento) => atualizarCampo("nome", evento.target.value)}
          placeholder="Ex.: GG"
          error={erros.nome}
          disabled={salvando}
          required
          autoFocus
        />
        <InputMoeda
          label="Preço"
          valor={dados.preco}
          onChange={(valor) => atualizarCampo("preco", valor)}
          error={erros.preco}
          disabled={salvando}
          required
        />

        {!emEdicao && (
          <Input
            label="Quantidade inicial"
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
        )}
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
            {emEdicao ? "Salvar alterações" : "Adicionar uniforme"}
          </Button>
        </footer>
      </form>
    </Modal>
  );
};
export default UniformeModal;
