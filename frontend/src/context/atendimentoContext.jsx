import { createContext, useContext, useState } from "react";

const AtendimentoContext = createContext();

export const AtendimentoProvider = ({children}) => {
    const [senhaAtual, setSenhaAtual] = useState(null);
    const [atendendo, setAtendendo] = useState(false);

    const [dados, setDados] = useState({
        cpf: "",
        nome: "",
        curso: "",
        ano: "",
        periodo: "",
    });

    return(
        <AtendimentoContext.Provider
        value={{
            senhaAtual,
            setSenhaAtual,
            atendendo,
            setAtendendo,
            dados,
            setDados
        }}
        >
            {children}
        </AtendimentoContext.Provider>
    );
};
export const useAtendimento = () => useContext(AtendimentoContext);