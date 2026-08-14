// Formulário da Triagem: busca o aluno e confirma seus dados antes de avançar.
import { useState } from "react";
import { IoMdSearch } from "react-icons/io";
import AtendimentoActions from "../common/AtendimentoActions";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { useAtendimento } from "../../hooks/useAtendimento";
import { useSelectsTriagem } from "../../hooks/useSelectsTriagem";
import { finalizarAtendimento } from "../../services/atendimentoService";
import * as TriagemService from "../../services/triagemService";
import FormaterCpf from "../../utils/formatters";

const TriagemForm = () => {
  const { atendendo, dados, senhaAtual, setDados, setErro } =
    useAtendimento();
  const {
    anos,
    periodos,
    cursos,
    carregandoCursos,
    catalogoDisponivel,
    erroCursos,
  } = useSelectsTriagem();
  const [buscandoAluno, setBuscandoAluno] = useState(false);
  const [matriculasEncontradas, setMatriculasEncontradas] = useState([]);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState("");
  const SIZE = "md";
  const dadosObrigatoriosPreenchidos = [
    dados.cpf,
    dados.nome,
    dados.curso,
    dados.ano,
    dados.periodo,
  ].every((valor) => valor?.trim());

  const buscarAluno = async () => {
    try {
      setBuscandoAluno(true);
      const resultado = await TriagemService.buscarAlunoPorCpf(dados.cpf);

      if (!resultado) {
        setErro("Nenhum aluno foi encontrado para o CPF informado.");
        return;
      }

      const matriculas = resultado.matriculas ?? [];
      setMatriculasEncontradas(matriculas);
      setMatriculaSelecionada("");
      setDados((anterior) => ({
        ...anterior,
        ...resultado.aluno,
        ...(matriculas.length === 1 ? matriculas[0] : {}),
      }));
      setErro(null);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setBuscandoAluno(false);
    }
  };

  const selecionarMatricula = (indice) => {
    setMatriculaSelecionada(indice);
    const matricula = matriculasEncontradas[Number(indice)];
    if (matricula) {
      setDados((anterior) => ({ ...anterior, ...matricula }));
    }
  };

  const salvarTriagem = async (atendimentoId) => {
    if (!senhaAtual || !dadosObrigatoriosPreenchidos) return false;

    await TriagemService.salvarDadosDaTriagem(senhaAtual.id, dados);
    await finalizarAtendimento(atendimentoId);
    return true;
  };

  return (
    <div className="bg-surface p-8 rounded-lg border border-border w-full max-w-5xl min-h-125 flex flex-col gap-6">
      {/* {erroCursos && <Alert type="error" message={erroCursos} />}
      {!carregandoCursos && !catalogoDisponivel && !erroCursos && (
        <Alert type="info" message="Nenhum curso está disponível no momento." />
      )} */}

      <div className="flex items-end gap-2 mb-4">
        <Input
          label="CPF do Aluno"
          value={dados.cpf}
          onChange={(event) =>
            setDados((anterior) => ({
              ...anterior,
              cpf: FormaterCpf(event.target.value),
            }))
          }
          disabled={!atendendo}
          placeholder="000.000.000-00"
          className="flex-1"
          maxLength={14}
          size={SIZE}
        />
        <Button
          variant="secondary"
          className="h-13.5 px-3"
          onClick={buscarAluno}
          disabled={!atendendo || !dados.cpf || buscandoAluno}
          loading={buscandoAluno}
          size={SIZE}
          aria-label="Buscar aluno pelo CPF"
        >
          <IoMdSearch size={20} />
        </Button>
      </div>

      {matriculasEncontradas.length > 1 && (
        <Select
          label="Matrícula encontrada"
          value={matriculaSelecionada}
          onChange={(event) => selecionarMatricula(event.target.value)}
          placeholder="Selecione a matrícula correta..."
          options={matriculasEncontradas.map((matricula, indice) => ({
            value: String(indice),
            label: `${matricula.curso} — ${matricula.ano}º — ${matricula.periodo}`,
          }))}
          disabled={!atendendo}
          size={SIZE}
        />
      )}

      <div className="mb-4">
        <Input
          label="Nome do Aluno"
          value={dados.nome}
          onChange={(event) =>
            setDados((anterior) => ({ ...anterior, nome: event.target.value }))
          }
          disabled={!atendendo}
          placeholder="Nome completo"
          size={SIZE}
        />
      </div>

      <div className="mb-4">
        <Select
          label="Curso"
          value={dados.curso}
          onChange={(event) =>
            setDados((anterior) => ({ ...anterior, curso: event.target.value }))
          }
          disabled={!atendendo || !catalogoDisponivel || carregandoCursos}
          placeholder={
            carregandoCursos ? "Carregando cursos..." : "Selecione o curso..."
          }
          options={cursos}
          size={SIZE}
        />
      </div>

      <div className="flex gap-4 mb-6">
        <Select
          label="Ano"
          value={dados.ano}
          onChange={(event) =>
            setDados((anterior) => ({ ...anterior, ano: event.target.value }))
          }
          disabled={!atendendo}
          placeholder="Ano..."
          options={anos}
          className="flex-1"
          size={SIZE}
        />
        <Select
          label="Período"
          value={dados.periodo}
          onChange={(event) =>
            setDados((anterior) => ({
              ...anterior,
              periodo: event.target.value,
            }))
          }
          disabled={!atendendo}
          placeholder="Período..."
          options={periodos}
          className="flex-1"
          size={SIZE}
        />
      </div>

      <AtendimentoActions
        podeFinalizar={dadosObrigatoriosPreenchidos}
        onFinalizar={salvarTriagem}
      />
    </div>
  );
};

export default TriagemForm;
