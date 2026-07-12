import Input from "../ui/Input";
import Button from "../ui/Button";
import Select from "../ui/Select";
import { IoMdSearch } from "react-icons/io";
import { useState } from "react";
import { useAtendimento } from "../../context/atendimentoContext";
import { useSelectsTriagem } from "../../hooks/useSelectsTriagem";
import FormaterCpf from "../../utils/formatters";
import AtendimentoActions from "../common/AtendimentoActions";

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

  const SIZE = "lg";

  const isDisabled =
    !dados.cpf || !dados.nome || !dados.curso || !dados.ano || !dados.periodo;

  // TODO: Requisição para back.
  const handleBuscar = async () => {
    if (!dados.cpf) return;

    const cpfLimpo = dados.cpf.replace(/\D/g, "");
    console.log("Buscando no banco o CPF:", cpfLimpo);

    try {
      //*matriculasMock deve ser substituido pela resposta do backend
      const matriculasMock = [
        {
          nome: "Jefferson Silva Costa",
          curso: "DS",
          ano: "2",
          periodo: "manha",
        },
        {
          nome: "Jefferson Silva Costa",
          curso: "Edif",
          ano: "1",
          periodo: "noite",
        },
      ];

      //Sem matriculas
      if (matriculasMock.length === 0) {
        alert(
          "Aluno não encontrado. Prossiga preenchendo os dados para cadastro manual.",
        );
        setDados((prev) => ({
          ...prev,
          nome: "",
          curso: "",
          ano: "",
          periodo: "",
        }));
        return;
      }

      //Uma matricula
      if (matriculasMock.length === 1) {
        setDados({
          cpf: dados.cpf,
          ...matriculasMock[0],
        });
        return;
      }

      //Mais de uma matricula
      alert(
        "Aluno possui mais de um curso ativo! Selecione o Curso, Ano e Período corretos abaixo.",
      );
      setDados((prev) => ({
        ...prev,
        nome: matriculasMock[0].nome,
        curso: "",
        ano: "",
        periodo: "",
      }));
    } catch (error) {
      console.error("Erro ao processar busca de aluno no frontend:", error);
    }
  };

  const formValido =
    dados.cpf && dados.nome && dados.curso && dados.ano && dados.periodo;

  const handleFinalizar = () => {
    if (!formValido) return;

    const payload = {
      senha: senhaAtual,
      aluno: dados,
      inicio: inicioAtendimento,
      fim: new Date(),
    };

    console.log(payload);

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
    <div className="bg-white p-8 rounded-lg border border-border w-full max-w-5xl min-h-[500px] flex flex-col gap-6">
      {/* CPF + botão */}
      <div className="flex items-end gap-2 mb-4">
        <Input
          label="CPF do Aluno"
          value={dados.cpf}
          onChange={(e) => {
            setDados((prev) => ({ ...prev, cpf: FormaterCpf(e.target.value) }));
          }}
          disabled={!atendendo}
          placeholder="000.000.000-00"
          className="flex-1"
          maxLength={14}
          size={SIZE}
        />

        <Button
          variant="secondary"
          onClick={handleBuscar}
          className="h-13.5 px-3"
          disabled={!dados.cpf}
          size={SIZE}
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
          size={SIZE}
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
          size={SIZE}
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
          size={SIZE}
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
          size={SIZE}
        />
      </div>

      {/* Botões */}
          <AtendimentoActions
          onIniciar={() => setAtendendo(true)}
          onFinalizar={handleFinalizar}
          />
    </div>
  );
};

export default TriagemForm;
