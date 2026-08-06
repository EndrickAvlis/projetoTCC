import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Alert from "../../../../components/ui/Alert";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";

const criarOfertaVazia = () => ({
    periodo: "",
    vagasTotais: "",
    matriculaAtiva: true,
});

const opcoesPeriodo = [
    { value: "manha", label: "Manhã" },
    { value: "tarde", label: "Tarde" },
    { value: "noite", label: "Noite" },
    { value: "integral", label: "Integral" },
];

const LIMITE_OFERTAS = 4;

const CursoFormModal = ({
    aberto,
    onFechar,
    onSalvar,
    salvando = false,
    erro = null,
}) => {
    const [nome, setNome] = useState("");
    const [ofertas, setOfertas] = useState([criarOfertaVazia()]);
    const [erros, setErros] = useState({});

    const limparFormulario = () => {
        setNome("");
        setOfertas([criarOfertaVazia()]);
        setErros({});
    };

    useEffect(() => {
        if (aberto) {
            limparFormulario();
        }
    }, [aberto]);

    const adicionarOferta = () => {
        if (ofertas.length >= LIMITE_OFERTAS) {
            return;
        }

        setOfertas((ofertasAtuais) => [...ofertasAtuais, criarOfertaVazia()]);
    };

    const removerOferta = (indice) => {
        setOfertas((ofertasAtuais) =>
            ofertasAtuais.filter((_, indiceOferta) => indiceOferta !== indice),
        );
    };

    const atualizarOferta = (indice, campo, valor) => {
        setOfertas((ofertasAtuais) =>
            ofertasAtuais.map((oferta, indiceOferta) =>
                indiceOferta === indice ? { ...oferta, [campo]: valor } : oferta,
            ),
        );
    };

    const validarFormulario = () => {
        const novosErros = { ofertasPorIndice: {} };

        if (!nome.trim()) {
            novosErros.nome = "Informe o nome do curso.";
        }

        if (ofertas.length === 0) {
            novosErros.ofertas = "Adicione pelo menos um período.";
        }

        const periodosInformados = new Set();

        ofertas.forEach((oferta, indice) => {
            const errosOferta = {};

            if (!oferta.periodo) {
                errosOferta.periodo = "Selecione um período.";
            } else if (periodosInformados.has(oferta.periodo)) {
                errosOferta.periodo = "Este período já foi adicionado.";
            }

            periodosInformados.add(oferta.periodo);

            const vagas = Number(oferta.vagasTotais);
            if (oferta.vagasTotais === "" || !Number.isInteger(vagas) || vagas < 0) {
                errosOferta.vagasTotais =
                    "Informe um número inteiro maior ou igual a zero.";
            }

            if (Object.keys(errosOferta).length > 0) {
                novosErros.ofertasPorIndice[indice] = errosOferta;
            }
        });

        const possuiErros =
            novosErros.nome ||
            novosErros.ofertas ||
            Object.keys(novosErros.ofertasPorIndice).length > 0;

        setErros(novosErros);
        return !possuiErros;
    };

    const handleSubmit = (evento) => {
        evento.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        onSalvar({
            nome: nome.trim(),
            ofertas: ofertas.map((oferta) => ({
                ...oferta,
                vagasTotais: Number(oferta.vagasTotais),
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
                            onClick={adicionarOferta}
                            leftIcon={<FiPlus />}
                            disabled={ofertas.length >= LIMITE_OFERTAS}
                        >
                            Adicionar período
                        </Button>
                    </div>

                    {erros.ofertas && <p className="text-sm text-status-danger">{erros.ofertas}</p>}

                    <div className="max-h-50 space-y-3 overflow-y-auto pr-2">
                        {ofertas.map((oferta, indice) => (
                            <div key={indice} className="rounded-card border border-border bg-surface-muted p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="font-medium text-text-primary">Período {indice + 1}</h4>
                                    {ofertas.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removerOferta(indice)}
                                            leftIcon={<FiTrash2 />}
                                        >
                                            Remover
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Select
                                        label="Período"
                                        placeholder="Selecione o período"
                                        options={opcoesPeriodo}
                                        value={oferta.periodo}
                                        onChange={(evento) => atualizarOferta(indice, "periodo", evento.target.value)}
                                        error={erros.ofertasPorIndice?.[indice]?.periodo}
                                        required
                                    />
                                    <Input
                                        label="Vagas totais"
                                        type="number"
                                        min="0"
                                        step="5"
                                        value={oferta.vagasTotais}
                                        onChange={(evento) => atualizarOferta(indice, "vagasTotais", evento.target.value)}
                                        error={erros.ofertasPorIndice?.[indice]?.vagasTotais}
                                        required
                                    />
                                </div>

                                <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-text-primary">
                                    <input
                                        type="checkbox"
                                        checked={oferta.matriculaAtiva}
                                        onChange={(evento) => atualizarOferta(indice, "matriculaAtiva", evento.target.checked)}
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
