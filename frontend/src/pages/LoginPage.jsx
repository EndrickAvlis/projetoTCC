import * as React from "react";
import { FiUser, FiLock } from "react-icons/fi";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { useAuth } from "../context/authContext";

const TELAS = [
  { value: "admin", label: "Administrador" },
  { value: "triagem", label: "Triagem" },
  { value: "apm", label: "APM" },
  { value: "docs", label: "Documentos" },
  { value: "secretaria", label: "Secretaria" },
];

const TELAS_COM_GUICHE = ["triagem", "apm", "docs"];

const obterTelaPorOrigem = (origem) => {
  const segmento = origem?.split("/").filter(Boolean)[0] ?? "";
  return TELAS.some((item) => item.value === segmento) ? segmento : "";
};

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    login,
    usuario,
    estaAutenticado,
    validandoSessao,
    alertaSessao,
    limparAlertaSessao,
  } = useAuth();

  const [nome, setNome] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [tela, setTela] = React.useState(() =>
    obterTelaPorOrigem(location.state?.origem),
  );
  const [guiche, setGuiche] = React.useState("");
  const [erros, setErros] = React.useState({});
  const [erro, setErro] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);

  const exigeGuiche = TELAS_COM_GUICHE.includes(tela);
  const mensagemAlerta = erro || alertaSessao;

  if (validandoSessao) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-page p-4 text-text-secondary">
        Validando sessão...
      </main>
    );
  }

  if (estaAutenticado && usuario?.tela) {
    return <Navigate to={`/${usuario.tela}`} replace />;
  }

  const limparMensagens = (campo) => {
    setErros((prev) => (prev[campo] ? { ...prev, [campo]: "" } : prev));
    if (erro) setErro("");
    if (alertaSessao) limparAlertaSessao();
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!nome.trim()) {
      novosErros.nome = "Informe o nome de usuário.";
    }

    if (!senha) {
      novosErros.senha = "Informe sua senha.";
    }

    if (!tela) {
      novosErros.tela = "Selecione a tela de acesso.";
    }

    if (exigeGuiche) {
      if (!guiche.trim()) {
        novosErros.guiche = "Informe o guichê.";
      } else if (guiche.trim().length > 4) {
        novosErros.guiche = "Máximo de 4 caracteres.";
      } else if (!/^[a-zA-Z0-9]+$/.test(guiche.trim())) {
        novosErros.guiche = "Use apenas letras ou números.";
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validarFormulario()) return;

    try {
      setCarregando(true);
      setErro("");
      if (alertaSessao) limparAlertaSessao();

      await login({
        nome: nome.trim(),
        senha,
        tela,
        guiche: exigeGuiche ? guiche.trim() : undefined,
      });
      navigate(`/${tela}`, { replace: true });
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-page p-4">
      <div className="bg-surface border border-border rounded-lg p-8 max-w-md w-full shadow-sm">
        <h1 className="text-title font-bold text-primary text-center mb-6">
          Entrar no sistema
        </h1>

        {mensagemAlerta && (
          <div className="mb-4">
            <Alert
              type="error"
              message={mensagemAlerta}
              onClose={() => {
                setErro("");
                if (alertaSessao) limparAlertaSessao();
              }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Nome de usuário"
            name="nome"
            size="md"
            maxLength={100}
            autoComplete="username"
            autoFocus
            placeholder="Digite seu usuário"
            value={nome}
            onChange={(event) => {
              setNome(event.target.value);
              limparMensagens("nome");
            }}
            error={erros.nome}
            disabled={carregando}
            icon={<FiUser />}
            iconPosition="left"
            required
          />

          <Input
            label="Senha"
            name="senha"
            size="md"
            type="password"
            maxLength={50}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(event) => {
              setSenha(event.target.value);
              limparMensagens("senha");
            }}
            error={erros.senha}
            disabled={carregando}
            icon={<FiLock />}
            iconPosition="left"
            required
          />

          <div className="flex gap-4 items-start">
            <Select
              label="Tela de acesso"
              name="tela"
              placeholder="Selecione a tela..."
              options={TELAS}
              value={tela}
              onChange={(event) => {
                const novaTela = event.target.value;
                setTela(novaTela);
                if (!TELAS_COM_GUICHE.includes(novaTela)) {
                  setGuiche("");
                  setErros((prev) => ({ ...prev, tela: "", guiche: "" }));
                } else {
                  setErros((prev) => ({ ...prev, tela: "" }));
                }
                if (erro) setErro("");
                if (alertaSessao) limparAlertaSessao();
              }}
              error={erros.tela}
              disabled={carregando}
              id="tela"
              required
            />
            {exigeGuiche && (
              <div className="max-w-37.5">
                <Input
                  label="Guichê"
                  name="guiche"
                  size="md"
                  type="text"
                  maxLength={4}
                  placeholder="Ex.: 01"
                  value={guiche}
                  onChange={(event) => {
                    setGuiche(event.target.value.replace(/[^a-zA-Z0-9]/g, ""));
                    limparMensagens("guiche");
                  }}
                  error={erros.guiche}
                  disabled={carregando}
                  required
                />
              </div>
            )}
          </div>

          <Button
            variant="primary"
            className="w-full mt-2"
            loading={carregando}
            type="submit"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;

