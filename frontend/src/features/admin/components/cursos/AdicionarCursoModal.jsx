import * as React from "react";
import * as FiIcons from "react-icons/fi";
import Alert from "../../../../components/ui/Alert";
import Button from "../../../../components/ui/button";
import Input from "../../../../components/ui/input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/select";
import { PERIODOS_CURSO } from "../../../../constants/cursoOptions";

const dadosIniciais = () => ({
    periodo: "",
    vagasTotais: "",
    matriculaAtiva: true,
});

const LIMITE_PERIODOS = 4;

const CursoFormModal = ({
    aberto,
    onFechar,
    onSalvar,
    salvando = false,
    erro = null,
}) => {
    const [nome, setNome] = React.useState("");
    const [periodos, setPeriodos] = React.useState([dadosIniciais()]);
    const [erros, setErros] = React.useState({});

    const limparFormulario = () => {
        setNome("");
        setPeriodos([dadosIniciais()]);
        setErros({});
    };

    React.useEffect(() => {
        if (aberto) {
            limparFormulario();
        }
    }, [aberto]);

    const adicionarPeriodo = () => {
        if (periodos.length >= LIMITE_PERIODOS) {
            return;
        }

        setPeriodos((periodosAtuais) => [...periodosAtuais, dadosIniciais()]);
    };

    const removerPeriodo = (indice) => {
        setPeriodos((periodosAtuais) =>
            periodosAtuais.filter((_, indicePeriodo) => indicePeriodo !== indice),
        );
    };

    const atualizarPeriodo = (indice, campo, valor) => {
        setPeriodos((periodosAtuais) =>
            periodosAtuais.map((periodoCurso, indicePeriodo) =>
                indicePeriodo === indice ? { ...periodoCurso, [campo]: valor } : periodoCurso,
            ),
        );
    };

    const validarFormulario = () => {
        const novosErros = { periodosPorIndice: {} };

        if (!nome.trim()) {
            novosErros.nome = "Informe o nome do curso.";
        }

        if (periodos.length === 0) {
            novosErros.periodos = "Adicione pelo menos um período.";
        }

        const periodosInformados = new Set();

        periodos.forEach((periodoCurso, indice) => {
            const errosPeriodo = {};

            if (!periodoCurso.periodo) {
                errosPeriodo.periodo = "Selecione um período.";
            } else if (periodosInformados.has(periodoCurso.periodo)) {
                errosPeriodo.periodo = "Este período já foi adicionado.";
            }

            periodosInformados.add(periodoCurso.periodo);

            const vagas = Number(periodoCurso.vagasTotais);
            if (periodoCurso.vagasTotais === "" || !Number.isInteger(vagas) || vagas < 0) {
                errosPeriodo.vagasTotais =
                    "Informe um número inteiro maior ou igual a zero.";
            }

            if (Object.keys(errosPeriodo).length > 0) {
                novosErros.periodosPorIndice[indice] = errosPeriodo;
            }
        });

        const possuiErros =
            novosErros.nome ||
            novosErros.periodos ||
            Object.keys(novosErros.periodosPorIndice).length > 0;

        setErros(novosErros);
        return !possuiErros;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        onSalvar({
            nome: nome.trim(),
            periodos: periodos.map((periodoCurso) => ({
                ...periodoCurso,
                vagasTotais: Number(periodoCurso.vagasTotais),
            })),
        });
    };

    return (
        <Modal
            aberto={aberto}
            onFechar={onFechar}
            titulo="Adicionar curso"
            conteudoRolavel={false}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {erro && <Alert type="error" message={erro} />}

                <Input
                    label="Nome do curso"
                    value={nome}
                    onChange={(evento) => setNome(evento.target.value)}
                    placeholder="Ex.: Desenvolvimento de Sistemas"
                    error={erros.nome}
                    required
                />

                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-text-primary">Períodos</h3>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={adicionarPeriodo}
                            leftIcon={<FiIcons.FiPlus />}
                            disabled={periodos.length >= LIMITE_PERIODOS}
                        >
                            Adicionar período
                        </Button>
                    </div>

                    {erros.periodos && <p className="text-sm text-status-danger">{erros.periodos}</p>}

                    <div className="max-h-50 space-y-3 overflow-y-auto pr-2">
                        {periodos.map((periodoCurso, indice) => (
                            <div key={indice} className="rounded-card border border-border bg-surface-muted p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="font-medium text-text-primary">Período {indice + 1}</h4>
                                    {periodos.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removerPeriodo(indice)}
                                            leftIcon={<FiIcons.FiTrash2 />}
                                        >
                                            Remover
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Select
                                        label="Período"
                                        placeholder="Selecione o período"
                                        options={PERIODOS_CURSO}
                                        value={periodoCurso.periodo}
                                        onChange={(evento) => atualizarPeriodo(indice, "periodo", evento.target.value)}
                                        error={erros.periodosPorIndice?.[indice]?.periodo}
                                        required
                                    />
                                    <Input
                                        label="Vagas totais"
                                        type="number"
                                        min="0"
                                        step="5"
                                        value={periodoCurso.vagasTotais}
                                        onChange={(evento) => atualizarPeriodo(indice, "vagasTotais", evento.target.value)}
                                        error={erros.periodosPorIndice?.[indice]?.vagasTotais}
                                        required
                                    />
                                </div>

                                <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-text-primary">
                                    <input
                                        type="checkbox"
                                        checked={periodoCurso.matriculaAtiva}
                                        onChange={(evento) => atualizarPeriodo(indice, "matriculaAtiva", evento.target.checked)}
                                    />
                                    Matrícula aberta para este período
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="flex justify-end gap-3 border-t border-border pt-5">
                    <Button type="button" variant="secondary" onClick={onFechar} disabled={salvando}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={salvando}>Salvar curso</Button>
                </footer>
            </form>
        </Modal>
    );
};

export default CursoFormModal;
