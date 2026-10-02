import * as Icons from 'react-icons/fi';

const opcoes = [
    {
        valor: "uniformes",
        label: "Uniformes",
        icon: Icons.FiTag,
    },
    {
        valor: "armarios",
        label: "Armários",
        icon: Icons.FiBox,
    },
];

const ProdutosTipoSelector = ({ tipoSelecionado, onSelecionar }) => {
    return (
        <div
            className="grid w-full max-w-md grid-cols-2 rounded-xl border border-border bg-surface p-1"
            role="tablist"
            aria-label="Tipo de produto"
        >
            {opcoes.map((opcao) => {
                const Icone = opcao.icon;
                const selecionada = tipoSelecionado === opcao.valor;

                return (
                    <button
                        key={opcao.valor}
                        id={`tab-${opcao.valor}`}
                        type="button"
                        role="tab"
                        aria-selected={selecionada}
                        aria-controls={`painel-${opcao.valor}`}
                        onClick={() => onSelecionar(opcao.valor)}
                        className={`flex items-center justify-center gap-2 rounded-btn px-4 py-2 text-sm font-medium transition-colors ${selecionada
                                ? "bg-primary text-text-inverse"
                                : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                            }`}
                    >
                        <Icone size={17} />
                        {opcao.label}
                    </button>
                );
            })}
        </div>
    )
}

export default ProdutosTipoSelector;