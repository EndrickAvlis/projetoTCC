import * as React from "react";
import { createPortal } from "react-dom";
import { FiMoreVertical } from "react-icons/fi";
import Button from "./Button";

const ActionMenu = ({ itens = [], label = "Ações" }) => {
  const [aberto, setAberto] = React.useState(false);
  const [posicao, setPosicao] = React.useState(null);
  const botaoRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const alternar = (evento) => {
    evento.stopPropagation();
    if (aberto) {
      setAberto(false);
      return;
    }

    const botao = evento.currentTarget.getBoundingClientRect();
    const abrirParaCima = window.innerHeight - botao.bottom < 150;

    setPosicao({
      top: abrirParaCima ? botao.top - 6 : botao.bottom + 6,
      right: window.innerWidth - botao.right,
      abrirParaCima,
    });
    setAberto(true);
  };

  React.useEffect(() => {
    if (!aberto) return;

    const fechar = (evento) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(evento.target) &&
        botaoRef.current &&
        !botaoRef.current.contains(evento.target)
      ) {
        setAberto(false);
      }
    };

    const fecharNoScroll = () => setAberto(false);

    document.addEventListener("mousedown", fechar);
    document.addEventListener("scroll", fecharNoScroll, true);

    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("scroll", fecharNoScroll, true);
    };
  }, [aberto]);

  const itensValidos = itens.filter(Boolean);

  if (itensValidos.length === 0) {
    return null;
  }

  if (itensValidos.length === 1) {
    const [itemUnico] = itensValidos;
    const varianteBotao =
      itemUnico.variante === "danger" || itemUnico.variante === "success"
        ? itemUnico.variante
        : "primary";

    return (
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant={varianteBotao}
          onClick={(evento) => {
            evento.stopPropagation();
            itemUnico.onClick();
          }}
          className="whitespace-nowrap"
        >
          {itemUnico.label}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <button
        ref={botaoRef}
        type="button"
        onClick={alternar}
        className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
        aria-label={label}
        title="Ações"
      >
        <FiMoreVertical size={18} />
      </button>

      {aberto &&
        posicao &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-60 w-48 rounded-lg border border-border bg-surface py-1 text-left shadow-lg animate-fade-in"
            style={{
              top: posicao.top,
              right: posicao.right,
              transform: posicao.abrirParaCima
                ? "translateY(-100%)"
                : undefined,
            }}
          >
            {itensValidos.map((item, index) => {
              const Icone = item.icone;
              const corTexto =
                item.variante === "danger"
                  ? "text-status-danger"
                  : item.variante === "success"
                    ? "text-status-success"
                    : "text-text-primary";

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setAberto(false);
                    item.onClick();
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-muted ${corTexto}`}
                >
                  {Icone && <Icone size={16} />}
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ActionMenu;
