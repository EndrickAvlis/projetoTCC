import * as React from "react";
import Input from "../../../../components/ui/input";
import Select from "../../../../components/ui/Select";
import {
  OPCOES_ANO_ESCOLAR,
  OPCOES_ESCOLARIDADE_PUBLICA,
  OPCOES_SEXO,
} from "../../constants/triagem";
import { PERIODOS_CURSO } from "../../../../constants/cursoOptions";

export const DadosAlunoForm = ({
  dados = {},
  onChange,
  erros = {},
  disabled = false,
  cursos = [],
  className = "",
}) => {
  const opcoesCursos = React.useMemo(() => {
    return cursos.map((curso) => ({
      value: String(curso.id),
      label: curso.nome,
    }));
  }, [cursos]);

  const handleChange = (campo) => (evento) => {
    if (onChange) {
      onChange(campo, evento.target.value);
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Dados do Candidato e Matrícula
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2">
        <Input
          label="Nome do Aluno"
          name="nome"
          value={dados.nome}
          onChange={handleChange("nome")}
          error={erros.nome}
          disabled={disabled}
          required
          placeholder="Nome completo do aluno"
        />
      </div>

      <div>
        <Input
          label="Classificação"
          name="classificacao"
          type="number"
          min="1"
          value={dados.classificacao}
          onChange={handleChange("classificacao")}
          error={erros.classificacao}
          disabled={disabled}
          required
          placeholder="Ex: 1"
        />
      </div>

      <div className="md:col-span-2">
        <Select
          label="Curso"
          name="curso"
          value={dados.curso}
          onChange={handleChange("curso")}
          options={opcoesCursos}
          placeholder="Selecione o curso..."
          error={erros.curso}
          disabled={disabled}
          required
        />
      </div>

      <div>
        <Select
          label="Período"
          name="periodo"
          value={dados.periodo}
          onChange={handleChange("periodo")}
          options={PERIODOS_CURSO}
          placeholder="Selecione o período..."
          error={erros.periodo}
          disabled={disabled}
          required
        />
      </div>

      <div>
        <Select
          label="Ano Escolar"
          name="ano"
          value={dados.ano}
          onChange={handleChange("ano")}
          options={OPCOES_ANO_ESCOLAR}
          placeholder="Selecione o ano..."
          error={erros.ano}
          disabled={disabled}
          required
        />
      </div>

      <div>
        <Select
          label="Escolaridade Pública"
          name="escolaridadePublica"
          value={dados.escolaridadePublica}
          onChange={handleChange("escolaridadePublica")}
          options={OPCOES_ESCOLARIDADE_PUBLICA}
          placeholder="Selecione..."
          error={erros.escolaridadePublica}
          disabled={disabled}
          required
        />
      </div>

      <div>
        <Select
          label="Sexo"
          name="sexo"
          value={dados.sexo}
          onChange={handleChange("sexo")}
          options={OPCOES_SEXO}
          placeholder="Selecione o sexo..."
          error={erros.sexo}
          disabled={disabled}
          required
        />
      </div>

      <div className="md:col-span-2 lg:col-span-2">
        <Input
          label="Cidade"
          name="cidade"
          value={dados.cidade}
          onChange={handleChange("cidade")}
          error={erros.cidade}
          disabled={disabled}
          required
          placeholder="Cidade do aluno"
        />
      </div>
    </div>
  </div>
);
};

export default DadosAlunoForm;
