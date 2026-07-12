import Button from "../ui/Button";
import { useAtendimento } from "../../context/atendimentoContext";
const AtendimentoActions = ({ onFinalizar, onIniciar}) => {
    const { senhaAtual, atendendo } = useAtendimento();
    return (
        <div className="flex gap-4 justify-between">
            <Button
            className="w-75 bg-[#7A8797] text-white hover:bg-[#6b7785]"
            disabled={!senhaAtual || atendendo}
            onClick={onIniciar}
            size={"lg"}
            >
                Iniciar Atendimento
            </Button>
            <Button
            className="w-75 bg-success-strong text-white hover:bg-success-hover"
            disabled={!atendendo}
            onClick={onFinalizar}
            size={"lg"}
            >
                Finalizar Atendimento
            </Button>
        </div>
    );
}
export default AtendimentoActions;