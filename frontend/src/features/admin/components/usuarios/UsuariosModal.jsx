import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";

const OPCOES_TIPO_ADMIN = [
  { value: "atendente", label: "Atendente" },
  { value: "supervisor", label: "Supervisor" },
  { value: "admin", label: "Administrador" },
];

const OPCOES_TIPO_SUPERVISOR = [
  { value: "atendente", label: "Atendente" },
];

const UsuariosModal = ({
  aberto,
  usuario = null,
  usuarioLogado = null,
  onFechar,
  onSalvar,
  salvando = false,
  erro = null,
}) => {
  const emEdicao = Boolean(usuario);
  const ehSupervisor = usuarioLogado?.tipo === "supervisor";

  const [nome, setNome] = React.useState("");
  const [tipo, setTipo] = React.useState("atendente");
  const [senha, setSenha] = React.useState("");
  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const [erros, setErros] = React.useState({});

  const opcoesTipo = ehSupervisor ? OPCOES_TIPO_SUPERVISOR : OPCOES_TIPO_ADMIN;

  React.useEffect(() => {
    if (aberto) {
      if (usuario) {
        setNome(usuario.nome);
        setTipo(usuario.tipo);
      } else {
        setNome("");
        setTipo("atendente");
      }
      setSenha("");
      setMostrarSenha(false);
      setErros({});
    }
  }, [aberto, usuario]);

  const validarFormulario = () => {
    const novosErros = {};

    if (!nome.trim()) {
      novosErros.nome = "Informe o nome do usuário.";
    }

    if (!tipo) {
      novosErros.tipo = "Selecione o cargo/função do usuário.";
    }

    if (!emEdicao) {
      if (!senha) {
        novosErros.senha = "Informe uma senha de acesso.";
      } else if (senha.length < 8) {
        novosErros.senha = "A senha deve ter no mínimo 8 caracteres.";
      }
    } else if (senha && senha.length < 8) {
      novosErros.senha = "A senha deve ter no mínimo 8 caracteres.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const payload = {
      nome: nome.trim(),
      tipo,
      ...(senha ? { senha } : {}),
      ...(!emEdicao ? { status: true } : {}),
    };

    onSalvar(payload);
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={emEdicao ? "Editar usuário" : "Adicionar usuário"}
      largura="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {erro && <p className="text-sm text-status-danger">{erro}</p>}

        <Input
          label="Nome completo"
          maxLength={100}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Maria Souza"
          error={erros.nome}
          autoFocus
          required
        />

        <Select
          label="Função / Cargo"
          options={opcoesTipo}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          error={erros.tipo}
          disabled={ehSupervisor}
          required
        />

        <div>
          <Input
            type={mostrarSenha ? "text" : "password"}
            label={emEdicao ? "Nova senha" : "Senha"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder={
              emEdicao
                ? "Deixe em branco para manter a atual"
                : "Mínimo de 8 caracteres"
            }
            error={erros.senha}
            required={!emEdicao}
            icon={
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="cursor-pointer text-text-secondary hover:text-text-primary focus:outline-none"
                title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                tabIndex={-1}
              >
                {mostrarSenha ? (
                  <FiIcons.FiEyeOff size={18} />
                ) : (
                  <FiIcons.FiEye size={18} />
                )}
              </button>
            }
            iconPosition="right"
          />
          {emEdicao && (
            <p className="mt-1 text-xs text-text-secondary">
              Preencha apenas se desejar redefinir a senha deste usuário.
            </p>
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

          <Button type="submit" loading={salvando}>
            {emEdicao ? "Salvar alterações" : "Salvar usuário"}
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default UsuariosModal;
