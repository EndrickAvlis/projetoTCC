// Alerta visual reutilizável para mensagens de sucesso, erro, aviso e informação.
import { IoMdClose } from "react-icons/io";

const Alert = ({
  type = "info", // success | error | warning | info
  message = "",
  onClose = null,
}) => {
  const styles = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div
      className={`w-full border px-4 py-3 rounded-md flex items-center justify-between ${styles[type]}`}
    >
      <span className="text-sm font-medium">{message}</span>

      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-lg opacity-70 hover:opacity-100"
        >
          <IoMdClose />
        </button>
      )}
    </div>
  );
};

export default Alert;
