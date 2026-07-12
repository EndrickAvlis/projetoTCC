import Button from "../ui/Button";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    //TODO: Chamada do backend e limpeza do navegador
    navigate("/");
  };

  return (
    <header className="w-full h-14 bg-primary text-white px-6 flex justify-end items-center">
      <Button
        variant="secondary"
        onClick={handleLogout}
        className="bg-transparent text-white max-h-10 px-5 hover:bg-primary-light"
        leftIcon={<MdLogout />}
      >
        Sair
      </Button>
    </header>
  );
};

export default Header;