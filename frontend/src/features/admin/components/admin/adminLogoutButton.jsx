import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAtendimento } from "../../../../hooks/useAtendimento";
import { useAuth } from "../../../../hooks/useAuth";
import { encerrarSessao } from "../../../../services/authService";

const AdminLogoutButton = ({ collapsed }) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { limparAtendimentoExibido } = useAtendimento();

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await encerrarSessao();
    } catch {
      // A sessão local deve ser removida mesmo se a API não responder.
    } finally {
      limparAtendimentoExibido();
      logout();
      navigate("/", { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={`mt-1 flex w-full items-center rounded-xl py-3 text-sm font-medium text-admin-sidebar-text transition-colors hover:bg-admin-sidebar-hover hover:text-text-inverse disabled:cursor-not-allowed disabled:opacity-60 ${
        collapsed ? "justify-center px-0" : "gap-3 px-3"
      }`}
    >
      <FiLogOut size={19} className="shrink-0" />

      {!collapsed && (
        <span className="whitespace-nowrap">
          {loggingOut ? "Saindo..." : "Sair"}
        </span>
      )}
    </button>
  );
};

export default AdminLogoutButton;
