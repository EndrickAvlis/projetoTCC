import * as React from "react";
import { createPortal } from "react-dom";
import * as FiIcons from "react-icons/fi";

const MenuAcoesCurso = ({
  curso,
  aberto,
  onAbrir,
  onFechar,
  onAdicionarPeriodo,
  onEditarNome,
  onAlterarArquivamento,
}) => {
  const [posicao, setPosicao] = React.useState(null);
  const botaoRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const alternarMenu = (evento) => {
    if (aberto) {
      onFechar();
      return;
    }

    const botao = evento.currentTarget.getBoundingClientRect();
    const abrirParaCima = window.innerHeight - botao.bottom < 144;

    setPosicao({
      top: abrirParaCima ? botao.top - 8 : botao.bottom + 8,
      right: window.innerWidth - botao.right,
      abrirParaCima,
    });
    onAbrir();
  };

  React.useEffect(() => {
    if (!aberto) {
      return undefined;
    }

    const fecharAoClicarFora = (evento) => {
      const clicouNoMenu = menuRef.current?.contains(evento.target);
      const clicouNoBotao = botaoRef.current?.contains(evento.target);

      if (!clicouNoMenu && !clicouNoBotao) {
        onFechar();
      }
    };

    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("scroll", onFechar, true);

    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("scroll", onFechar, true);
    };
  }, [aberto, onFechar]);

  const executarAcao = (acao) => {
    onFechar();
    acao(curso);
  };

  return (
    <div className="flex justify-end">
      <button
        ref={botaoRef}
        type="button"
        onClick={alternarMenu}
        className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
        aria-label={`Abrir ações do curso ${curso.nome}`}
        aria-expanded={aberto}
        title="Ações"
      >
        <FiIcons.FiMoreVertical size={18} />
      </button>

      {aberto &&
        posicao &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-60 w-52 rounded-lg border border-border bg-surface py-1 text-left shadow-lg"
            style={{
              top: posicao.top,
              right: posicao.right,
              transform: posicao.abrirParaCima
                ? "translateY(-100%)"
                : undefined,
            }}
          >
            {!curso.arquivado && (
              <button
                type="button"
                onClick={() => executarAcao(onAdicionarPeriodo)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
              >
                <FiIcons.FiPlus size={16} />
                Adicionar período
              </button>
            )}

            <button
              type="button"
              onClick={() => executarAcao(onEditarNome)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
            >
              <FiIcons.FiEdit2 size={16} />
              Editar nome
            </button>

            <button
              type="button"
              onClick={() => executarAcao(onAlterarArquivamento)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-surface-muted ${
                curso.arquivado ? "text-status-success" : "text-status-danger"
              }`}
            >
              {curso.arquivado ? (
                <FiIcons.FiRotateCcw size={16} />
              ) : (
                <FiIcons.FiArchive size={16} />
              )}
              {curso.arquivado ? "Desarquivar" : "Arquivar"}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default MenuAcoesCurso;
