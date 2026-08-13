// Tela de login: envia credenciais e registra a sessão retornada pela API.
import { useState } from "react";
import * as FaIcons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { useAuth } from "../hooks/useAuth";
import { autenticar } from "../services/authService";

const TELAS = [
  { value: "admin", label: "Administrador" },
  { value: "secretaria", label: "Secretaria" },
  { value: "triagem", label: "Triagem" },
  { value: "apm", label: "APM" },
  { value: "docs", label: "Docs" },
];

const TELAS_COM_GUICHE = ["triagem", "apm", "docs"];

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [tela, setTela] = useState("");
  const [guiche, setGuiche] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { registrarSessao } = useAuth();

  const exigeGuiche = TELAS_COM_GUICHE.includes(tela);
  const formularioInvalido =
    !username || !senha || !tela || (exigeGuiche && !guiche);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setCarregando(true);
      setErro("");
      const resposta = await autenticar({
        username,
        senha,
        tela,
        guiche: exigeGuiche ? guiche : null,
      });
      const sessao = registrarSessao(resposta);
      navigate(`/${sessao.telaAtual}`, { replace: true });
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <div className="bg-surface border border-border rounded-lg p-8 max-w-md w-full shadow-sm">
        <h1 className="text-body font-bold text-primary text-center mb-6">
          Entrar no sistema
        </h1>

        {erro && (
          <div className="bg-status-danger-bg text-status-danger border border-status-danger rounded-md px-4 py-2 text-sm mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome de usuário"
            size="md"
            placeholder="Digite seu usuário"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            icon={<FaIcons.FaUser className="text-primary" />}
            iconPosition="left"
          />

          <Input
            label="Senha"
            size="md"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            icon={<FaIcons.FaLock className="text-primary" />}
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
