import * as React from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { useAuth } from "../context/authContext";

const TELAS = [
  { value: "admin", label: "Administrador" },
  { value: "triagem", label: "Triagem" },
  { value: "apm", label: "APM" },
  { value: "docs", label: "Docs" },
];

const TELAS_COM_GUICHE = ["triagem", "apm", "docs"];

const LoginPage = () => {
  const [nome, setNome] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [tela, setTela] = React.useState("");
  const [guiche, setGuiche] = React.useState("");
  const [erro, setErro] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const exigeGuiche = TELAS_COM_GUICHE.includes(tela);
  const formularioInvalido =
    !nome || !senha || !tela || (exigeGuiche && !guiche);

  React.useEffect(() => {
    const mensagemSessao = sessionStorage.getItem("alerta_sessao");
    if (mensagemSessao) {
      setErro(mensagemSessao);
      sessionStorage.removeItem("alerta_sessao");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setCarregando(true);
      setErro("");
      const resposta = await login({
        nome,
        senha,
        tela,
        guiche: exigeGuiche ? guiche : undefined,
      });
      navigate(`/${tela}`, { replace: true });
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <div className="bg-surface border border-border rounded-lg p-8 max-w-md w-full shadow-sm">
        <h1 className="text-title font-bold text-primary text-center mb-6">
          Entrar no sistema
        </h1>

        {erro && (
          <div className="mb-4">
            <Alert type="error" message={erro} onClose={() => setErro("")} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome de usuário"
            size="md"
            placeholder="Digite seu usuário"
            value={nome}
            onChange={(event) => {
              setNome(event.target.value);
              if (erro) setErro("");
            }}
            icon={<FaUser className="text-primary" />}
            iconPosition="left"
          />

          <Input
            label="Senha"
            size="md"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(event) => {
              setSenha(event.target.value);
              if (erro) setErro("");
            }}
            icon={<FaLock className="text-primary" />}
            iconPosition="left"
          />

          <div className="flex gap-4 items-end">
            <Select
              label="Tela de acesso"
              placeholder="Selecione a tela..."
              options={TELAS}
              value={tela}
              onChange={(event) => setTela(event.target.value)}
              id="tela"
            />
            {exigeGuiche && (
              <div className="max-w-37.5">
                <Input
                  label="Guichê"
                  size="md"
                  type="text"
                  placeholder="Digite"
                  value={guiche}
                  onChange={(event) => setGuiche(event.target.value)}
                />
              </div>
            )}
          </div>

          <Button
            variant="primary"
            className="w-full mt-2"
            disabled={formularioInvalido}
            loading={carregando}
            type="submit"
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
