import * as React from "react";
import { createPortal } from "react-dom";
import * as FiIcons from "react-icons/fi";

const MenuAcoesUniforme = ({
    uniforme,
    aberto,
    onAbrir,
    onFechar,
    onMovimentarEstoque,
    onEditar,
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

        const botao =
            evento.currentTarget.getBoundingClientRect();

        const abrirParaCima =
            window.innerHeight - botao.bottom < 100;

        setPosicao({
            top: abrirParaCima
                ? botao.top - 8
                : botao.bottom + 8,

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
            const clicouNoMenu =
                menuRef.current?.contains(evento.target);

            const clicouNoBotao =
                botaoRef.current?.contains(evento.target);

            if (!clicouNoMenu && !clicouNoBotao) {
                onFechar();
            }
        };

        document.addEventListener(
            "mousedown",
            fecharAoClicarFora,
        );

        document.addEventListener(
            "scroll",
            onFechar,
            true,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                fecharAoClicarFora,
            );

            document.removeEventListener(
                "scroll",
                onFechar,
                true,
            );
        };
    }, [aberto, onFechar]);

    const movimentarEstoque = () => {
        onFechar();
        onMovimentarEstoque(uniforme);
    };
    const executarAcao = (acao) => {
        onFechar();
        acao(uniforme);
    };

    return (
        <div className="flex justify-end">
            <button
                ref={botaoRef}
                type="button"
                onClick={alternarMenu}
                className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                aria-label={`Abrir ações do uniforme ${uniforme.nome}`}
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
                        <button
                            type="button"
                            onClick={() => executarAcao(onEditar)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
                        >
                            <FiIcons.FiEdit2 size={16} />
                            Editar uniforme
                        </button>

                        <button
                            type="button"
                            onClick={() => executarAcao(onMovimentarEstoque)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
                        >
                            <FiIcons.FiPackage size={16} />
                            Movimentar estoque
                        </button>

                        <button
                            type="button"
                            onClick={() => executarAcao(onAlterarArquivamento)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-surface-muted ${uniforme.status === "arquivado"
                                    ? "text-status-success"
                                    : "text-status-danger"
                                }`}
                        >
                            {uniforme.status === "arquivado" ? (
                                <FiIcons.FiRotateCcw size={16} />
                            ) : (
                                <FiIcons.FiArchive size={16} />
                            )}

                            {uniforme.status === "arquivado"
                                ? "Desarquivar"
                                : "Arquivar"}
                        </button>
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default MenuAcoesUniforme;