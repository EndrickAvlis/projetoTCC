import Input from "../ui/Input";
import Button from "../ui/Button";
import Select from "../ui/Select";
import { IoMdSearch } from "react-icons/io";
import { useState } from "react";
import { useAtendimento } from "../../context/atendimentoContext";
import { useSelectsTriagem } from "../../hooks/useSelectsTriagem";

const TriagemForm = ({ finalizarSenha }) => {
  const {
    senhaAtual,
    setSenhaAtual,
    atendendo,
    setAtendendo,
    dados,
    setDados,
  } = useAtendimento();
  const [inicioAtendimento, setInicioAtendimento] = useState(null);
  const { anos, periodos, cursos, carregandoCursos } = useSelectsTriagem();
  const isDisabled = !dados.cpf || !dados.nome || !dados.curso || !dados.ano || !dados.periodo;

  // TODO: Requisição para back.
  const handleBuscar = () => {
    console.log("Buscar CPF:", dados.cpf);
  };

  // TODO: Fazer a fomatação correta dos dados e se eles estão preenchidos
  const formValido =
    dados.cpf && dados.nome && dados.curso && dados.ano && dados.periodo;

  // TODO: Requisição para back.
  const handleFinalizar = () => {
    if (!formValido) return;

    const payload = {
      senha: senhaAtual,
      aluno: dados,
      // TODO: A data de inicio deve vir ao apertar inciar atendimento
      inicio: inicioAtendimento,
      fim: new Date(),
    };
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
    <div className="bg-white p-8 rounded-lg border border-border w-full max-w-5xl min-h-125 flex flex-col gap-6">
      {/* CPF + botão */}
      <div className="flex items-end gap-2 mb-4">
        <Input
          label="CPF do Aluno"
          value={dados.cpf}
          onChange={(e) => {
            setDados((prev) => ({ ...prev, cpf: e.target.value }));
          }}
          disabled={!atendendo}
          placeholder="000.000.000-00"
          className="flex-1"
          required
        />
        <Button
          variant="secondary"
          onClick={handleBuscar}
          className="h-10.5 px-3"
          disabled={!dados.cpf}
        >
          <IoMdSearch size={20} />
        </Button>
      </div>

      {/* Nome */}
      <div className="mb-4">
        <Input
          label="Nome do Aluno"
          value={dados.nome}
          onChange={(e) => {
            setDados((prev) => ({ ...prev, nome: e.target.value }));
          }}
          disabled={!atendendo}
          placeholder="Nome completo"
          required
        />
      </div>

      {/* Curso */}
      <div className="mb-4">
        <Select
          label="Curso"
          value={dados.curso}
          onChange={(e) => {
            setDados((prev) => ({ ...prev, curso: e.target.value }));
          }}
          disabled={!atendendo || carregandoCursos}
          placeholder={
            carregandoCursos ? "Carregando cursos..." : "Selecione o curso..."
          }
          options={cursos}
          required
        />
      </div>

      {/* Ano + Período */}
      <div className="flex gap-4 mb-6">
        <Select
          label="Ano"
          value={dados.ano}
          onChange={(e) => {
            setDados((prev) => ({ ...prev, ano: e.target.value }));
          }}
          disabled={!atendendo}
          placeholder="Ano..."
          options={anos}
          className="flex-1"
          required
        />
        <Select
          label="Período"
          value={dados.periodo}
          onChange={(e) => {
            setDados((prev) => ({ ...prev, periodo: e.target.value }));
          }}
          disabled={!atendendo}
          placeholder="Período..."
          options={periodos}
          className="flex-1"
          required
        />
      </div>

      {/* Botões */}
      <div className="flex gap-4 justify-between">
        <Button
          className="bg-[#7A8797] text-white hover:bg-[#6b7785]"
          disabled={!senhaAtual || atendendo}
          onClick={() => {
            setAtendendo(true);
            setInicioAtendimento(new Date());
          }}
        >
          Iniciar Atendimento
        </Button>

        <Button
          className="bg-[#7A8797] text-white hover:bg-[#6b7785]"
          disabled={!atendendo || isDisabled}
          onClick={handleFinalizar}
        >
          Finalizar Atendimento
        </Button>
      </div>
    </div>
  );
};

export default TriagemForm;
