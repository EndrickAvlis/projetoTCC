import { useState, useEffect } from "react";
import { useAtendimento } from "../../context/atendimentoContext";
import Button from "../ui/Button";
import Input from "../ui/Input";
import AtendimentoActions from "../common/AtendimentoActions";

const DocsPanel = ({ finalizarSenha }) => {
  const {
    senhaAtual,
    setSenhaAtual,
    atendendo,
    setAtendendo,
    dados,
    setDados,
  } = useAtendimento();

  const [inicioAtendimento, setInicioAtendimento] = useState(null);
  const SIZE = "lg";

  const handleIniciar = () => {
    if (!senhaAtual) return;
    setAtendendo(true);
    setInicioAtendimento(new Date());

    // Mockando dados que teoricamente viriam preenchidos da Triagem/APM para este aluno
    setDados({
      cpf: dados.cpf || "123.456.789-00",
      nome: dados.nome || "Jefferson Silva Costa",
      curso: dados.curso || "Desenvolvimento de Sistemas",
      ano: dados.ano || "2º Ano",
      periodo: dados.periodo || "Integral",
    });
  };

  const handleFinalizar = () => {
    if (!senhaAtual || !atendendo) return;

    const payload = {
      senha: senhaAtual,
      aluno: dados,
      inicio: inicioAtendimento,
      fim: new Date(),
      statusFinal: "CONCLUÍDO_TOTAL"
    };

    console.log("Encerrando fluxo completo do aluno no SIGA Phila:", payload);

    finalizarSenha(senhaAtual);
    setAtendendo(false);
    setSenhaAtual(null);
    setDados({
      cpf: "",
      nome: "",
      curso: "",
      ano: "",
      periodo: "",
    });
  };

  return (
    <div className="bg-white p-8 rounded-lg border border-border w-full max-w-5xl min-h-125 flex flex-col justify-between gap-6">
      
      {/* Título informativo da etapa */}
      <div className="border-b border-border pb-4">
        <h2 className="text-title font-bold text-primary uppercase tracking-wide">
          Conferência e Entrega de Documentos
        </h2>
        <p className="text-body text-gray-500 mt-1">
          Última etapa do fluxo de matrícula. Confirme os dados abaixo antes de encerrar o atendimento.
        </p>
      </div>

      {/* Formulário Bloqueado (Visualização dos Dados vindos da Triagem) */}
      <div className="flex flex-col gap-4 flex-1 justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CPF do Aluno"
            value={dados.cpf}
            disabled={true} // Sempre desativado na conferência de documentos
            placeholder="000.000.000-00"
            size={SIZE}
          />
          <Input
            label="Nome do Aluno"
            value={dados.nome}
            disabled={true}
            placeholder="Nome do Aluno"
            size={SIZE}
          />
        </div>

        <Input
          label="Curso"
          value={dados.curso}
          disabled={true}
          placeholder="Curso do Aluno"
          size={SIZE}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ano"
            value={dados.ano}
            disabled={true}
            placeholder="Ano"
            size={SIZE}
          />
          <Input
            label="Período"
            value={dados.periodo}
            disabled={true}
            placeholder="Período"
            size={SIZE}
          />
        </div>
      </div>

      {/* Botões de Acão*/}
      <AtendimentoActions onIniciar={() => setAtendendo(true)} onFinalizar={handleFinalizar}/>
    </div>
  );
};

export default DocsPanel;