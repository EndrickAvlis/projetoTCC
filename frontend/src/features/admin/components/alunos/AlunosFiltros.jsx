import * as React from 'react';
import * as FiIcons from 'react-icons/fi';
import Input from "../../../../components/ui/input"
import Select from "../../../../components/ui/select"
import Button from "../../../../components/ui/button"

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
    status,
    onAlterarStatus,
    cursos = [],
}) => {
    const opcoesCursos = React.useMemo(() => {
        return cursos.map((curso) => ({
            value: String(curso.id),
            label: curso.nome,
        }));
    }, [cursos]);

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
            </div>

            <div className="flex gap-1 rounded-btn border border-border p-1 bg-surface"
                aria-label="Situação dos alunos">
                {OPCOES.map((opcao) => {
                    const ativo = status === opcao.valor;
                    return (
                        <Button
                            key={opcao.valor}
                            size="sm"
                            variant={ativo ? "primary" : "secondary"}
                            onClick={() => onAlterarStatus(opcao.valor)}
                            aria-pressed={ativo}
                            className={!ativo ? "bg-transparent text-text-secondary hover:bg-surface-muted" : ""}
                        >
                            {opcao.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default AlunosFiltros;
