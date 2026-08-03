// Cabeçalho do posto: mostra a sessão atual e permite encerrar o acesso.
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAtendimento } from "../../hooks/useAtendimento";
import { useAuth } from "../../hooks/useAuth";
import { encerrarSessao } from "../../services/authService";
import Button from "../ui/Button";

const Header = () => {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();
  const { limparAtendimentoExibido } = useAtendimento();

  const handleLogout = async () => {
    try {
      await encerrarSessao();
    } catch {
      // Mesmo sem resposta da API, os dados sensíveis devem sair da tela local.
    } finally {
      limparAtendimentoExibido();
      logout();
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="w-full min-h-14 bg-primary text-text-inverse px-6 flex justify-between items-center gap-4">
      <div>
        <p>Usuário: {usuario?.nome ?? ""}</p>
        <p>
          Área: {usuario?.telaAtual ?? usuario?.postoAtual ?? ""}
          {usuario?.guiche ? ` — Guichê ${usuario.guiche}` : ""}
        </p>
      </div>
      <Button
        variant="secondary"
        onClick={handleLogout}
        className="bg-transparent text-text-inverse max-h-10 px-5 hover:bg-primary-hover"
        leftIcon={<MdLogout />}
      >
        Sair
      </Button>
    </header>
  );
};

export default Header;
