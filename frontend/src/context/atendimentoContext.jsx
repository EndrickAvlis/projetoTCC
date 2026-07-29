// Contexto visual compartilhado entre a fila e o formulário do posto.
import { useEffect, useState } from "react";
import { AtendimentoContext } from "./atendimentoContextBase";


const dadosAlunoIniciais = {
  cpf: "",
  nome: "",
  curso: "",
  ano: "",
  periodo: "",
};

const normalizarDetalheSenha = (detalhe) => {
  const { senha = null, aluno = {}, matricula = {} } = detalhe;

  return {
    senha,
    dados: {
      cpf: aluno.cpf ?? "",
      nome: aluno.nome ?? "",
      curso: matricula?.curso ?? "",
      ano: matricula?.ano ?? "",
      periodo: matricula?.periodo ?? "",
    },
  };
};

export const AtendimentoProvider = ({ children }) => {
  // Exibe a senha retornada por POST /filas/chamadas e pelo endpoint de detalhe.
  const [senhaAtual, setSenhaAtual] = useState(null);

  // Guarda apenas a referência do atendimento criado pelo backend.
  const [atendendo, setAtendendo] = useState(false);
  const [atendimentoAtual, setAtendimentoAtual] = useState(null);

  // Mantém os dados recebidos da API e as edições temporárias do formulário.
  const [dados, setDados] = useState(dadosAlunoIniciais);

  // Estados exclusivos de apresentação para carregamento e mensagens da API.
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Adapta o detalhe retornado pela API para os campos usados pelas telas.
  const exibirDetalheSenha = (detalhe) => {
    const atendimento = normalizarDetalheSenha(detalhe);
    setSenhaAtual(atendimento.senha);
    setDados(atendimento.dados);
  };

  // Limpa somente a tela depois que o servidor cancela ou finaliza o atendimento.
  const limparAtendimentoExibido = () => {
    setSenhaAtual(null);
    setDados(dadosAlunoIniciais);
    setAtendendo(false);
    setAtendimentoAtual(null);
  };

  useEffect(() => {
    const limparSessaoInvalida = () => {
      setSenhaAtual(null);
      setDados(dadosAlunoIniciais);
      setAtendendo(false);
      setAtendimentoAtual(null);
      setErro(null);
    };

    window.addEventListener("auth:unauthorized", limparSessaoInvalida);
    return () =>
      window.removeEventListener("auth:unauthorized", limparSessaoInvalida);
  }, []);

  return (
    <AtendimentoContext.Provider
      value={{
        senhaAtual,
        setSenhaAtual,
        atendendo,
        setAtendendo,
        atendimentoAtual,
        setAtendimentoAtual,
        dados,
        setDados,
        carregando,
        setCarregando,
        erro,
        setErro,
        exibirDetalheSenha,
        limparAtendimentoExibido,
      }}
    >
      {children}
    </AtendimentoContext.Provider>
  );
};
