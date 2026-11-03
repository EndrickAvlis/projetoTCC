import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAtendimento } from "../context/atendimentoContext";
import { useAuth } from "../../../context/authContext";
import Button from "../../../components/ui/Button";

const NOMES_POSTOS = {
  triagem: "Triagem",
  apm: "APM",
  docs: "Documentos",
};

const Header = ({ etapa: etapaProp }) => {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();
  const { limparAtendimento } = useAtendimento();

  const etapa = etapaProp || usuario?.tela;
  const nomePosto =
    NOMES_POSTOS[etapa] || (etapa ? etapa.toUpperCase() : "Atendimento");

  const handleLogout = async () => {
    await logout();
    limparAtendimento();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 bg-primary text-text-inverse px-6 py-2.5 shadow-xs">
      <div className="grid grid-cols-3 items-center min-h-14 gap-4">
        <div className="flex items-center justify-start">
          <div className="text-left">
            <p className="text-sm font-semibold text-text-inverse leading-tight truncate">
              Atendente: {usuario?.nome || "Usuário"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-xl font-bold text-text-inverse leading-tight">
            {nomePosto}
          </h1>
          {usuario?.guiche && (
            <p className="text-sm font-medium text-primary-text-muted mt-0.5">
              Guichê {usuario.guiche}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleLogout}
            leftIcon={<FiLogOut />}
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
