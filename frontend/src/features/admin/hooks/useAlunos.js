import * as React from 'react';
import { listarAlunosAdmin } from "../services/AlunosService";

export const useAlunos = ({
    busca = "",
    cursoId = "",
    status = "ATIVO",
    pagina = 1,
    limite = 10,
} = {}) => {
    const [alunos, setAlunos] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [totalAtivos, setTotalAtivos] = React.useState(0);
    const [carregando, setCarregando] = React.useState(true);
    const [erro, setErro] = React.useState(null);

    const carregarAlunos = React.useCallback(async () => {
        setCarregando(true);
        setErro(null);

        try {
            const res = await listarAlunosAdmin({
                busca,
                cursoId,
                status,
                pagina,
                limite,
            });

            setAlunos(res?.alunos ?? []);
            setTotal(res?.total ?? 0)
            if (typeof res?.totalAtivos === "number") {
                setTotalAtivos(res.totalAtivos);
            }
        } catch (error) {
            setAlunos([]);
            setTotal(0)
            setErro(error.message || "Erro ao carregar lista de alunos");
        } finally {
            setCarregando(false);
        }
    }, [busca, cursoId, status, pagina, limite]);

    React.useEffect(() => {
        carregarAlunos();
    }, [carregarAlunos]);

    return {
        alunos,
        total,
        totalAtivos,
        carregando,
        erro,
        recarregar: carregarAlunos,
    }
}