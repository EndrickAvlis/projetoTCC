import * as React from 'react';
import * as FiIcons from 'react-icons/fi';
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import TableFiltro from "../../../../components/ui/TableFiltro";

const OPCOES = [
    { valor: "ATIVO", label: "Ativos" },
    { valor: "CANDIDATO", label: "Candidatos" },
    { valor: "ARQUIVADO", label: "Arquivados" },
];

const AlunosFiltros = ({
    busca,
    onAlterarBusca,
    cursoId,
    onAlterarCurso,
    cidade,
    onAlterarCidade,
    cidades = [],
    status,
    onAlterarStatus,
    cursos = [],
}) => {
    const opcoesCursos = cursos.map((curso) => ({
        value: String(curso.id),
        label: curso.nome,
    }));

    const opcoesCidades = cidades.map((c) => ({
        value: c,
        label: c,
    }));

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                    value={busca}
                    onChange={(e) => onAlterarBusca(e.target.value)}
                    placeholder="Pesquisar por nome do aluno..."
                    icon={<FiIcons.FiSearch />}
                    size="md"
                    className="w-full sm:max-w-md"
                />
                <div className="w-full sm:w-64">
                    <Select
                        value={cursoId}
                        onChange={(e) => onAlterarCurso(e.target.value)}
                        placeholder="Todos os cursos"
                        options={opcoesCursos}
                        size="md"
                    />
                </div>
                <div className="w-full sm:w-56">
                    <Select
                        value={cidade}
                        onChange={(e) => onAlterarCidade(e.target.value)}
                        placeholder="Todas as cidades"
                        options={opcoesCidades}
                        size="md"
                    />
                </div>
            </div>

            <TableFiltro
                options={OPCOES}
                value={status}
                onChange={onAlterarStatus}
                ariaLabel="Situação dos alunos"
            />
        </div>
    );
};

export default AlunosFiltros;
