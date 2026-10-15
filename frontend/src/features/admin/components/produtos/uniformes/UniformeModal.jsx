import * as React from "react";

import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import InputMoeda from "../../../../../components/ui/InputMoeda";
import Modal from "../../../../../components/ui/Modal";

const dadosIniciais = {
  nome: "",
  preco: 0,
  quantidade: 0,
};

const UniformeModal = ({
  aberto,
  uniforme = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  const emEdicao = Boolean(uniforme);

  const [dados, setDados] = React.useState(dadosIniciais);
  const [erros, setErros] = React.useState({});

  React.useEffect(() => {
    if (aberto) {
      if (uniforme) {
        setDados({
          nome: uniforme.nome,
          preco: uniforme.preco,
          quantidade: uniforme.quantidade,
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
      newErrors.nome = "Insira um tamanho.";
    } else if (nome.length > 50) {
      newErrors.nome = "O tamanho deve ter no máximo 50 caracteres.";
    }

    if (!Number.isFinite(preco) || preco <= 0) {
      newErrors.preco = "Insira o preço.";
    }
    if (!emEdicao) {
      if (dados.quantidade === "") {
        newErrors.quantidade = "Insira a quantidade inicial.";
      } else if (!Number.isInteger(quantidade)) {
        newErrors.quantidade = "Informe uma quantidade inteira.";
      } else if (quantidade < 0) {
        newErrors.quantidade = "A quantidade inicial deve ser maior ou igual a 0.";
      }
    }

    setErros(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarUniformeForm()) return;
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
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={emEdicao ? "Editar uniforme" : "Adicionar uniforme"}
      largura="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
          placeholder="00,00"
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
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}
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
