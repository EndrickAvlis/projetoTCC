import * as React from "react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";

const OPCOES_TIPO = [
  { value: "atendente", label: "Atendente" },
  { value: "supervisor", label: "Supervisor" },
  { value: "admin", label: "Administrador" },
];

const UsuariosModalForm = ({
  usuario = null,
  usuarioLogado = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  const emEdicao = Boolean(usuario);
  const ehAdmin = usuarioLogado?.tipo === "admin";
  const ehProprioUsuario = Boolean(
    emEdicao && usuario.id === usuarioLogado?.id,
  );
  const cargoBloqueado = salvando || !ehAdmin || ehProprioUsuario;

  const [nome, setNome] = React.useState(() => usuario?.nome ?? "");
  const [tipo, setTipo] = React.useState(() => usuario?.tipo ?? "atendente");
  const [senha, setSenha] = React.useState("");
  const [erros, setErros] = React.useState({});

  const limparErro = (campo) => {
    setErros((prev) => (prev[campo] ? { ...prev, [campo]: "" } : prev));
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!nome.trim()) {
      novosErros.nome = "Informe o nome de usuário.";
    }

    if (!tipo) {
      novosErros.tipo = "Selecione a função do usuário.";
    }

    if (!emEdicao && !senha) {
      novosErros.senha = "Informe uma senha de acesso.";
    } else if (senha && senha.length < 8) {
      novosErros.senha = "A senha deve ter no mínimo 8 caracteres.";
    } else if (senha && senha.length > 50) {
      novosErros.senha = "A senha deve ter no máximo 50 caracteres.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const payload = {
      nome: nome.trim(),
      ...(!emEdicao || (ehAdmin && !ehProprioUsuario) ? { tipo } : {}),
      ...(senha ? { senha } : {}),
      ...(!emEdicao ? { status: true } : {}),
    };

    onSalvar(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <Input
          label="Nome de usuário"
          maxLength={100}
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            limparErro("nome");
          }}
          placeholder="Digite o nome de usuário"
          error={erros.nome}
          disabled={salvando}
          autoFocus
          required
        />
      </div>

      <Select
        label="Função"
        options={OPCOES_TIPO}
        value={tipo}
        onChange={(e) => {
          setTipo(e.target.value);
          limparErro("tipo");
        }}
        error={erros.tipo}
        disabled={cargoBloqueado}
        required
      />

      <div>
        <Input
          type="password"
          label={emEdicao ? "Nova senha" : "Senha"}
          maxLength={50}
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            limparErro("senha");
          }}
          placeholder={
            emEdicao
              ? "Deixe em branco para manter a atual"
              : "Mínimo de 8 caracteres"
          }
          error={erros.senha}
          disabled={salvando}
          required={!emEdicao}
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
  );
};

const UsuariosModal = ({
  aberto,
  usuario = null,
  usuarioLogado = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={usuario ? "Editar usuário" : "Adicionar usuário"}
      largura="max-w-lg"
    >
      {aberto && (
        <UsuariosModalForm
          key={usuario ? `edit-${usuario.id}` : "new"}
          usuario={usuario}
          usuarioLogado={usuarioLogado}
          onFechar={onFechar}
          onSalvar={onSalvar}
          salvando={salvando}
        />
      )}
    </Modal>
  );
};

export default UsuariosModal;
