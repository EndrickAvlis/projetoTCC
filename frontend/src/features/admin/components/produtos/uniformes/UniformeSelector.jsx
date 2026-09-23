import * as FiIcons from "react-icons/fi";

import Input from "../../../../../components/ui/input";

const UniformeSelector = ({
    busca,
    onAlterarBusca,
    arquivado,
    onAlterarArquivado,
}) => {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <Input
                value={busca}
                onChange={(e) => onAlterarBusca(e.target.value)}
                placeholder="Pesquisar por tamanho..."
                icon={<FiIcons.FiSearch />}
                size="md"
                className="max-w-xl"
            />

            <div
                className="flex rounded-btn border border-border p-1"
                aria-label="Situação dos uniformes"
            >
                <button
                    type="button"
                    onClick={() => onAlterarArquivado(false)}
                    aria-pressed={!arquivado}
                    className={`rounded-btn px-3 py-2 text-sm font-medium transition-colors ${!arquivado
                        ? "bg-primary text-text-inverse"
                        : "text-text-secondary hover:bg-surface-muted"
                        }`}
                >
                    Ativos
                </button>

                <button
                    type="button"
                    onClick={() => onAlterarArquivado(true)}
                    aria-pressed={arquivado}
                    className={`rounded-btn px-3 py-2 text-sm font-medium transition-colors ${arquivado
                        ? "bg-primary text-text-inverse"
                        : "text-text-secondary hover:bg-surface-muted"
                        }`}
                >
                    Arquivados
                </button>
            </div>
        </div>
    );
};

export default UniformeSelector;
