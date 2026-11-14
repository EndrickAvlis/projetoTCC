import { useEffect, useRef, useState } from "react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Toggle from "../../../../components/ui/Toggle";
import {
  OPCOES_ANO_ESCOLAR,
  OPCOES_SEXO,
} from "../../constants/triagem";
import { PERIODOS_CURSO } from "../../../../constants/cursoOptions";
import { CIDADES_SP } from "../../../../constants/cidadesSp";

const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const DadosAlunoForm = ({
  dados = {},
  onChange,
  erros = {},
  disabled = false,
  cursos = [],
  className = "",
}) => {
  const [cidadesAberto, setCidadesAberto] = useState(false);
  const [indiceCidade, setIndiceCidade] = useState(-1);
  const cidadeRef = useRef(null);

  const termoCidade = normalizarTexto(dados.cidade);
  const cidadesFiltradas = (
    termoCidade
      ? CIDADES_SP.filter((cidade) =>
          normalizarTexto(cidade).includes(termoCidade)
        )
      : CIDADES_SP
  ).slice(0, 30);

  useEffect(() => {
    const handleClickFora = (evento) => {
      if (cidadeRef.current && !cidadeRef.current.contains(evento.target)) {
        setCidadesAberto(false);
      }
    };

    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);
  const opcoesCursos = cursos.map((curso) => ({
    value: String(curso.id),
    label: curso.nome,
  }));

  const cursoSelecionado = cursos.find(
    (c) => String(c.id) === String(dados.curso),
  );

  const periodosAtivos = new Set(
    cursoSelecionado?.periodos
      ?.filter((p) => p.matriculaAtiva)
      .map((p) => p.periodo) || [],
  );

  const opcoesPeriodos = PERIODOS_CURSO.filter((p) =>
    periodosAtivos.has(p.value),
  );

  const handleChange = (campo) => (evento) => {
    if (onChange) {
      onChange(campo, evento.target.value);
    }
  };

  const selecionarCidade = (cidade) => {
    if (onChange) {
      onChange("cidade", cidade);
    }
    setCidadesAberto(false);
    setIndiceCidade(-1);
  };

  const handleCidadeChange = (evento) => {
    if (onChange) {
      onChange("cidade", evento.target.value);
    }
    setCidadesAberto(true);
    setIndiceCidade(-1);
  };

  const handleCidadeKeyDown = (evento) => {
    if (disabled) return;

    if (!cidadesAberto || cidadesFiltradas.length === 0) {
      if (evento.key === "ArrowDown") {
        setCidadesAberto(true);
      }
      return;
    }

    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setIndiceCidade((prev) =>
        prev < cidadesFiltradas.length - 1 ? prev + 1 : 0
      );
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setIndiceCidade((prev) =>
        prev > 0 ? prev - 1 : cidadesFiltradas.length - 1
      );
    } else if (
      evento.key === "Enter" &&
      indiceCidade >= 0 &&
      indiceCidade < cidadesFiltradas.length
    ) {
      evento.preventDefault();
      selecionarCidade(cidadesFiltradas[indiceCidade]);
    } else if (evento.key === "Escape" || evento.key === "Tab") {
      setCidadesAberto(false);
      setIndiceCidade(-1);
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Dados do Candidato e Matrícula
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        <div className="sm:col-span-2 lg:col-span-9">
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

        <div className="sm:col-span-2 lg:col-span-3">
          <Select
            label="Sexo"
            name="sexo"
            value={dados.sexo}
            onChange={handleChange("sexo")}
            options={OPCOES_SEXO}
            placeholder="Selecione..."
            error={erros.sexo}
            disabled={disabled}
            required
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-5">
          <Select
            key={`curso-${opcoesCursos.length}`}
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

        <div className="sm:col-span-2 lg:col-span-3">
          <Select
            key={`periodo-${dados.curso}-${opcoesPeriodos.length}`}
            label="Período"
            name="periodo"
            value={dados.periodo}
            onChange={handleChange("periodo")}
            options={opcoesPeriodos}
            placeholder={
              dados.curso ? "Selecione..." : "Selecione um curso"
            }
            error={erros.periodo}
            disabled={disabled || !dados.curso}
            required
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-2">
          <Select
            label="Ano Escolar"
            name="ano"
            value={dados.ano}
            onChange={handleChange("ano")}
            options={OPCOES_ANO_ESCOLAR}
            placeholder="Selecione..."
            error={erros.ano}
            disabled={disabled}
            required
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-2">
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

        <div ref={cidadeRef} className="relative sm:col-span-2 lg:col-span-8">
          <Input
            label="Cidade"
            name="cidade"
            autoComplete="off"
            value={dados.cidade}
            onFocus={() => {
              if (!disabled) {
                setCidadesAberto(true);
              }
            }}
            onChange={handleCidadeChange}
            onKeyDown={handleCidadeKeyDown}
            error={erros.cidade}
            disabled={disabled}
            required
            placeholder="Digite ou selecione a cidade do aluno"
          />
          {cidadesAberto && !disabled && cidadesFiltradas.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-surface shadow-lg">
              <ul className="divide-y divide-border/60">
                {cidadesFiltradas.map((cidade, index) => (
                  <li
                    key={cidade}
                    onClick={() => selecionarCidade(cidade)}
                    className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                      index === indiceCidade
                        ? "bg-surface-muted text-primary"
                        : "text-text-primary hover:bg-surface-muted"
                    }`}
                  >
                    {cidade}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <span className="block text-sm font-medium text-primary mb-1">
            Escolaridade Pública
          </span>
          <div className="min-h-10.5 flex items-center rounded-btn border border-border bg-surface px-3.5">
            <Toggle
              checked={Boolean(dados.escolaridadePublica)}
              onChange={(valor) =>
                onChange && onChange("escolaridadePublica", valor)
              }
              disabled={disabled}
              label={dados.escolaridadePublica ? "Sim (Escola pública)" : "Não"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DadosAlunoForm;
