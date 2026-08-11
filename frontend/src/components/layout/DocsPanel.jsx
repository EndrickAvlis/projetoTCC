// Painel que exibe os dados recebidos da API para conferência dos documentos.
import { useAtendimento } from "../../hooks/useAtendimento";
import Input from "../ui/Input";
import AtendimentoActions from "../common/AtendimentoActions";

const DocsPanel = () => {
  const { dados } = useAtendimento();
  const SIZE = "md";

  return (
    <div className="bg-surface p-8 rounded-lg border border-border w-full max-w-5xl min-h-125 flex flex-col justify-between gap-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-title font-bold text-primary uppercase tracking-wide">
          Conferência e Entrega de Documentos
        </h2>
        <p className="text-body text-text-secondary mt-1">
          Última etapa do fluxo de matrícula. Confirme os dados abaixo antes de
          encerrar o atendimento.
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="CPF do Aluno" value={dados.cpf} disabled placeholder="000.000.000-00" size={SIZE} />
          <Input label="Nome do Aluno" value={dados.nome} disabled placeholder="Nome do Aluno" size={SIZE} />
        </div>
        <Input label="Curso" value={dados.curso} disabled placeholder="Curso do Aluno" size={SIZE} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Ano" value={dados.ano} disabled placeholder="Ano" size={SIZE} />
          <Input label="Período" value={dados.periodo} disabled placeholder="Período" size={SIZE} />
        </div>
      </div>

      <AtendimentoActions />
    </div>
  );
};

export default DocsPanel;
