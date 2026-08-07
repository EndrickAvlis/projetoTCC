const periodosValidos = new Set(["manha", "tarde", "noite", "integral"]);

const palavrasMinusculas = new Set([
  "a",
  "as",
  "o",
  "os",
  "de",
  "da",
  "das",
  "do",
  "dos",
  "e",
  "em",
  "na",
  "nas",
  "no",
  "nos",
  "para",
  "por",
]);

const normalizarNome = (nome) => {
  if (typeof nome !== "string") {
    return "";
  }

  return nome
    .trim()
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .map((palavra, indice) => {
      if (indice > 0 && palavrasMinusculas.has(palavra)) {
        return palavra;
      }

      return palavra.charAt(0).toLocaleUpperCase("pt-BR") + palavra.slice(1);
    })
    .join(" ");
};

const normalizarPeriodo = (periodo) =>
  typeof periodo === "string" ? periodo.trim().toLowerCase() : "";

const normalizarVagasTotais = (vagasTotais) => {
  if (typeof vagasTotais === "string" && vagasTotais.trim() !== "") {
    return Number(vagasTotais);
  }

  return vagasTotais;
};

export const validarNomeCurso = (nome) => {
  const nomeNormalizado = normalizarNome(nome);
  const erros = {};

  if (!nomeNormalizado) {
    erros.nome = "Informe o nome do curso.";
  }

  if (nomeNormalizado.length > 100) {
    erros.nome = "O nome deve ter no máximo 100 caracteres.";
  }

  return {
    valido: Object.keys(erros).length === 0,
    dados: {
      nome: nomeNormalizado,
    },
    erros,
  };
};

export const validarPeriodoCurso = (periodoCurso = {}) => {
  const periodo = normalizarPeriodo(periodoCurso?.periodo);
  const vagasTotais = normalizarVagasTotais(periodoCurso?.vagasTotais);
  const matriculaAtiva = periodoCurso?.matriculaAtiva;

  const erros = {};

  if (!periodosValidos.has(periodo)) {
    erros.periodo = "Informe um período válido.";
  }

  if (!Number.isInteger(vagasTotais) || vagasTotais < 0) {
    erros.vagasTotais = "Informe um número inteiro maior ou igual a zero.";
  }

  if (typeof matriculaAtiva !== "boolean") {
    erros.matriculaAtiva = "Informe verdadeiro ou falso para a matrícula.";
  }

  return {
    valido: Object.keys(erros).length === 0,
    dados: {
      periodo,
      vagasTotais,
      matriculaAtiva,
    },
    erros,
  };
};

export const validarDadosCurso = (curso = {}) => {
  const dadosCurso = curso ?? {};
  const validacaoNome = validarNomeCurso(dadosCurso.nome);
  const periodosEnviados =
    dadosCurso.periodos === undefined ? [] : dadosCurso.periodos;

  const erros = {
    ...validacaoNome.erros,
  };

  if (!Array.isArray(periodosEnviados)) {
    erros.periodos = "Os períodos devem ser uma lista.";
  }

  const periodosNormalizados = [];
  const errosPeriodos = [];
  const periodosInformados = new Set();

  if (Array.isArray(periodosEnviados)) {
    periodosEnviados.forEach((periodoCurso, indice) => {
      const validacaoPeriodo = validarPeriodoCurso(periodoCurso);
      const errosPeriodo = {
        ...validacaoPeriodo.erros,
      };

      if (
        validacaoPeriodo.dados.periodo &&
        periodosInformados.has(validacaoPeriodo.dados.periodo)
      ) {
        errosPeriodo.periodo = "Este período já foi informado para o curso.";
      }

      periodosInformados.add(validacaoPeriodo.dados.periodo);

      periodosNormalizados.push(validacaoPeriodo.dados);

      if (Object.keys(errosPeriodo).length > 0) {
        errosPeriodos[indice] = errosPeriodo;
      }
    });
  }

  if (errosPeriodos.length > 0) {
    erros.periodos = errosPeriodos;
  }

  return {
    valido: Object.keys(erros).length === 0,
    dados: {
      nome: validacaoNome.dados.nome,
      periodos: periodosNormalizados,
    },
    erros,
  };
};

export const validarArquivamentoCurso = (arquivado) => {
  const erros = {};

  if (typeof arquivado !== "boolean") {
    erros.arquivado = "Informe verdadeiro ou falso para o arquivamento.";
  }

  return {
    valido: Object.keys(erros).length === 0,
    dados: {
      arquivado,
    },
    erros,
  };
};
