import * as React from 'react';
import Modal from "../../../../components/ui/Modal";
import { useCursos } from "../../../hooks/useCursos";
import * as AlunosService from "../../../services/AlunosService";

const ImportarAlunosModal = ({ aberto, onFechar, onSucesso }) => {
    const [etapa, setEtapa] = React.useState(1);
    const [anoProcesso, setAnoProcesso] = React.useState(new Date().getFullYear());
    const [semestreProcesso, setSemestreProcesso] = React.useState("1");
    const [dadosArquivo, setDadosArquivo] = React.useState(null);
    const [gruposCursos, setGruposCursos] = React.useState([]);
    const [resultadoFinal, setResultadoFinal] = React.useState(null);
    const [carregando, setCarregando] = React.useState(false);
    const [erro, setErro] = React.useState(null);

    const { cursos: cursosExistentes } = useCursos({ arquivado: false });

    const handleFechar = () => {
        setEtapa(1);
        setDadosArquivo(null);
        setGruposCursos([]);
        setResultadoFinal(null);
        setErro(null);
        onFechar();
    };

    const handleArquivoAnalisado = (dados) => {
        setDadosArquivo(dados);
        setGruposCursos(dados.resultado.gruposCursos);
    };

    const handleAtualizarAssociacao = (codigoCsv, idCurso) => {
        setGruposCursos((atuais) =>
            atuais.map((item) =>
                item.codigoCsv === codigoCsv ? { ...item, idCurso } : item
            )
        );
    };

    const handleConfirmarImportacao = async () => {
        setCarregando(true);
        setErro(null);
        try {
            const mapeamentoCursos = gruposCursos.map((g) => ({
                codigoCsv: g.codigoCsv,
                idCurso: Number(g.idCurso),
            }));
            const resposta = await AlunosService.importarAlunos({
                anoProcesso: Number(anoProcesso),
                semestreProcesso: Number(semestreProcesso),
                mapeamentoCursos,
                candidatos: dadosArquivo.resultado.candidatosValidos,
            });
            setResultadoFinal(resposta);
            setEtapa(3); // Avança para a tela de resultado
        } catch (err) {
            setErro(err.message || "Erro ao importar candidatos.");
        } finally {
            setCarregando(false);
        }
    };

    const handleConcluir = () => {
        handleFechar();
        if (onSucesso) onSucesso();
    };

    return (
        <Modal
            aberto={aberto}
            onFechar={handleFechar}
            titulo="Importar Lista de Classificação"
            largura="max-w-3xl"
        >
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                {[
                    { num: 1, label: "Selecionar Arquivo" },
                    { num: 2, label: "Mapear Cursos" },
                    { num: 3, label: "Conclusão" },
                ].map((step, idx) => {
                    const ativo = etapa === step.num;
                    const concluido = etapa > step.num;
                    return (
                        <div key={step.num} className="flex items-center gap-2">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${concluido
                                    ? "bg-status-success text-text-inverse"
                                    : ativo
                                        ? "bg-primary text-text-inverse"
                                        : "bg-surface-muted text-text-secondary border border-border"
                                    }`}
                            >
                                {concluido ? "✓" : step.num}
                            </div>
                            <span
                                className={`text-xs font-medium sm:text-sm ${ativo ? "text-text-primary font-semibold" : "text-text-secondary"
                                    }`}
                            >
                                {step.label}
                            </span>
                            {idx < 2 && <div className="mx-2 hidden h-[1px] w-8 bg-border sm:block" />}
                        </div>
                    );
                })}
            </div>

            {"modais de etapas"}
        </Modal>
    );
};

export default ImportarAlunosModal;