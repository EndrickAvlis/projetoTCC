import { FiX } from "react-icons/fi";

const Modal = ({
    aberto,
    onFechar,
    titulo,
    children,
    largura = "max-w-2xl",
    conteudoRolavel = true,
}) => {
    if (!aberto) {
        return null;
    }

    return (
        <div
            className="animate-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onFechar}
        >
            <div
                className={`w-full ${largura} ${conteudoRolavel ? "max-h-[90vh] overflow-y-auto" : ""
                    } animate-modal-panel rounded-xl bg-surface shadow-xl`}
                onClick={(evento) => evento.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="text-xl font-semibold text-text-primary">{titulo}</h2>
                    <button
                        type="button"
                        onClick={onFechar}
                        className="rounded-btn p-2 text-text-secondary transition-[background-color,color,transform] duration-200 ease-out hover:bg-surface-muted hover:text-text-primary active:scale-[0.95]"
                    >
                        <FiX size={20} />
                    </button>
                </header>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
