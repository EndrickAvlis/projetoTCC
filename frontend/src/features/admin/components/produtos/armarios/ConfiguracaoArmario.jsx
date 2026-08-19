import * as FiIcons from "react-icons/fi";

import Button from "../../../../../components/ui/Button";
import { formatarMoeda } from "../../../../../utils/formatters";

const ConfiguracaoArmario = ({
    armario,
    onEditar,
    onAlterarDisponibilidade,
    salvando = false,
}) => {
    const estaDisponivel = armario.status === "disponivel";

    return (
        <section className="rounded-xl border border-border bg-surface p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <FiIcons.FiGrid size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">
                                Configuração do armário
                            </h2>

                            <p className="mt-1 text-sm text-text-secondary">
                                Defina o preço, a quantidade disponível e a
                                visibilidade na APM.
                            </p>
                        </div>
                    </div>
                </div>

                <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${estaDisponivel
                        ? "bg-status-success-bg text-status-success"
                        : "bg-disabled-bg text-text-secondary"
                        }`}
                >
                    {estaDisponivel
                        ? "Disponível na APM"
                        : "Indisponível na APM"}
                </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                    <p className="text-sm text-text-secondary">
                        Preço
                    </p>

                    <p className="mt-1 text-xl font-semibold text-text-primary">
                        {formatarMoeda(Number(armario.preco))}
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-surface-muted p-4">
                    <p className="text-sm text-text-secondary">
                        Quantidade disponível
                    </p>

                    <p className="mt-1 text-xl font-semibold text-text-primary">
                        {armario.quantidade}
                    </p>
                </div>
            </div>

            <footer className="mt-6 flex flex-col justify-end gap-3 border-t border-border pt-5 sm:flex-row">
                <Button
                    type="button"
                    variant="secondary"
                    
                    leftIcon={<FiIcons.FiEdit2 />}
                    onClick={onEditar}
                    disabled={salvando}
                >
                    Editar configuração
                </Button>

                <Button
                    type="button"
                    variant={
                        estaDisponivel
                            ? "danger"
                            : "success"
                    }
                    leftIcon={
                        estaDisponivel
                            ? <FiIcons.FiEyeOff />
                            : <FiIcons.FiEye />
                    }
                    onClick={onAlterarDisponibilidade}
                    loading={salvando}
                >
                    {estaDisponivel
                        ? "Ocultar na APM"
                        : "Disponibilizar na APM"}
                </Button>
            </footer>
        </section>
    );
};

export default ConfiguracaoArmario;