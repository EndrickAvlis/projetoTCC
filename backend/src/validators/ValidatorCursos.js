const periodosValidos = new Set(["manha", "tarde", "noite", "integral"]);

const normalizarNome = (nome) => (typeof nome === "string" ? nome.trim() : "");

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

export const validarOfertaCurso = (oferta = {}) => {
  const periodo = normalizarPeriodo(oferta?.periodo);
  const vagasTotais = normalizarVagasTotais(oferta?.vagasTotais);
  const matriculaAtiva = oferta?.matriculaAtiva;

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
  const ofertasEnviadas =
    dadosCurso.ofertas === undefined ? [] : dadosCurso.ofertas;

  const erros = {
    ...validacaoNome.erros,
  };

  if (!Array.isArray(ofertasEnviadas)) {
    erros.ofertas = "As ofertas devem ser uma lista.";
  }

  const ofertasNormalizadas = [];
  const errosOfertas = [];
  const periodosInformados = new Set();

  if (Array.isArray(ofertasEnviadas)) {
    ofertasEnviadas.forEach((oferta, indice) => {
      const validacaoOferta = validarOfertaCurso(oferta);
      const errosOferta = {
        ...validacaoOferta.erros,
      };

      if (
        validacaoOferta.dados.periodo &&
        periodosInformados.has(validacaoOferta.dados.periodo)
      ) {
        errosOferta.periodo = "Este período já foi informado para o curso.";
      }

      periodosInformados.add(validacaoOferta.dados.periodo);

      ofertasNormalizadas.push(validacaoOferta.dados);

      if (Object.keys(errosOferta).length > 0) {
        errosOfertas[indice] = errosOferta;
      }
    });
  }

  if (errosOfertas.length > 0) {
    erros.ofertas = errosOfertas;
  }

  return {
    valido: Object.keys(erros).length === 0,
    dados: {
      nome: validacaoNome.dados.nome,
      ofertas: ofertasNormalizadas,
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
