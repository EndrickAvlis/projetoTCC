// Alerta visual reutilizável para mensagens de sucesso, erro, aviso e informação.
import { IoMdClose } from "react-icons/io";

const Alert = ({
  type = "info", // success | error | warning | info
  message = "",
  onClose = null,
}) => {
  const styles = {
    success: "bg-status-success-bg text-status-success border-status-success",
    error: "bg-status-danger-bg text-status-danger border-status-danger",
    warning: "bg-status-warning-bg text-status-warning border-status-warning",
    info: "bg-status-info-bg text-status-info border-status-info",
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
