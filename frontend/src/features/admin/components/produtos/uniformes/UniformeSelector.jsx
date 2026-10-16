import * as FiIcons from "react-icons/fi";

import Input from "../../../../../components/ui/Input";
import TableFiltro from "../../../../../components/ui/TableFiltro";

const OPCOES_UNIFORME = [
    { valor: false, label: "Ativos" },
    { valor: true, label: "Arquivados" },
];

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

            <TableFiltro
                options={OPCOES_UNIFORME}
                value={arquivado}
                onChange={onAlterarArquivado}
                ariaLabel="Situação dos uniformes"
            />
        </div>
    );
};

export default UniformeSelector;
