import * as React from "react";
import Alert from "../../../../components/ui/Alert";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import { PERIODOS_CURSO } from "../../../../constants/cursoOptions";

const dadosIniciais = {
    periodo: "",
    vagasTotais: "",
    matriculaAtiva: true,
}

const PeriodoModal = ({
    aberto,
    periodo,
    onFechar,
    onSalvar,
    salvando = false,
    erro = null,
}) => {
    const emEdicao = Boolean(periodo);

    const [dados, setDados] = React.useState(dadosIniciais);
    const [erros, setErros] = React.useState({});

    React.useEffect(() => {
        if (aberto) {
            if (periodo) {
                setDados({
                    periodo: periodo.periodo || "",
                    vagasTotais: periodo.vagasTotais,
                    matriculaAtiva: periodo.matriculaAtiva ?? true,
                })
            } else {
                setDados(dadosIniciais);
            }
        }
        setErros({});
    }, [aberto, periodo]);

    const atualizarCampo = (campo, value) => {
        setDados((prevs) => ({
            ...prevs,
            [campo]: value
        }))
    }

    const validarPeriodoForm = () => {
        const newErrors = {};
        const vagas = Number(dados.vagasTotais);
        if (!dados.periodo) {
            newErrors.periodo = "Selecione um período.";
        }
        if (
            dados.vagasTotais === "" ||
            !Number.isInteger(vagas) ||
            vagas < 0
        ) {
            newErrors.vagasTotais = "Informe um número inteiro maior ou igual a zero.";
        }
        setErros(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validarPeriodoForm()) return;

        onSalvar({
            ...dados,
            vagasTotais: Number(dados.vagasTotais),
        })
    }

    return (
        <Modal
            aberto={aberto}
            onFechar={() => !salvando && onFechar()}
            titulo={emEdicao ? "Editar período" : "Adicionar período"}
            largura="max-w-lg"
            // conteudoRolavel={false}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {erro && <Alert type="error" message={erro} />}

                <Select
                    label="Período"
                    placeholder="Selecione o período"
                    options={PERIODOS_CURSO}
                    value={dados.periodo}
                    onChange={(e) => atualizarCampo("periodo", e.target.value)}
                    error={erros.periodo}
                    required
                />

                <Input
                    label="Vagas totais"
                    type="number"
                    min="0"
                    step="5"
                    value={dados.vagasTotais}
                    onChange={(e) => atualizarCampo("vagasTotais", e.target.value)}
                    error={erros.vagasTotais}
                    required
                />

                <label className="flex cursor-pointer items-center gap-3 text-sm text-text-primary">
                    <input
                        type="checkbox"
                        checked={dados.matriculaAtiva}
                        onChange={(e) => atualizarCampo("matriculaAtiva", e.target.checked)}
                    />
                    Matrícula aberta para este período
                </label>

                <footer className="flex justify-end gap-3 border-t border-border pt-5">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onFechar}
                        disabled={salvando}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" loading={salvando}>
                        {emEdicao ? "Salvar alterações" : "Adicionar período"}
                    </Button>
                </footer>
            </form>
        </Modal>
    );
};

export default PeriodoModal;
