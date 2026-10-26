// Colunas obrigatórias exigidas pela documentação TELA_ALUNOS.md
export const CABECALHOS_OBRIGATORIOS = [
  "NOME",
  "ESCOLARIDADE",
  "CIDADE",
  "SEXO",
  "CLASSIFICACAO",
  "HABILITACAO",
  "PERIODO",
];

// 1. Decodificação com suporte a UTF-8 e Windows-1252
export const decodificarCsv = (arrayBuffer) => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(arrayBuffer);
  } catch {
    return new TextDecoder("windows-1252").decode(arrayBuffer);
  }
};

// 2. Parser CSV compatível com RFC-4180 (aspas, delimitador ;, quebras de linha)
export const parsearCsv = (texto, delimitador = ";") => {
  const linhas = [];
  let linhaAtual = [];
  let celulaAtual = "";
  let dentroDeAspas = false;

  for (let i = 0; i < texto.length; i += 1) {
    const char = texto[i];

    if (dentroDeAspas) {
      if (char === '"') {
        if (texto[i + 1] === '"') {
          celulaAtual += '"';
          i += 1;
        } else {
          dentroDeAspas = false;
        }
      } else {
        celulaAtual += char;
      }
      continue;
    }

    if (char === '"') {
      dentroDeAspas = true;
    } else if (char === delimitador) {
      linhaAtual.push(celulaAtual);
      celulaAtual = "";
    } else if (char === "\n") {
      linhaAtual.push(celulaAtual.replace(/\r$/, ""));
      if (linhaAtual.some((val) => val.trim() !== "")) {
        linhas.push(linhaAtual);
      }
      linhaAtual = [];
      celulaAtual = "";
    } else {
      celulaAtual += char;
    }
  }

  if (celulaAtual.length > 0 || linhaAtual.length > 0) {
    linhaAtual.push(celulaAtual.replace(/\r$/, ""));
    if (linhaAtual.some((val) => val.trim() !== "")) {
      linhas.push(linhaAtual);
    }
  }

  if (linhas.length === 0) {
    throw new Error("O arquivo CSV está vazio.");
  }

  // Remove BOM (\uFEFF) do primeiro cabeçalho se houver
  const cabecalhos = linhas
    .shift()
    .map((c) => c.replace(/^\uFEFF/, "").trim().toUpperCase());

  // Validação das colunas obrigatórias
  const colunasFaltantes = CABECALHOS_OBRIGATORIOS.filter(
    (col) => !cabecalhos.includes(col),
  );

  if (colunasFaltantes.length > 0) {
    throw new Error(
      `Colunas obrigatórias ausentes no CSV: ${colunasFaltantes.join(", ")}`,
    );
  }

  // Transforma cada linha em um objeto chave-valor
  const registros = linhas.map((valores) =>
    Object.fromEntries(
      cabecalhos.map((cabecalho, idx) => [
        cabecalho,
        valores[idx]?.trim() ?? "",
      ]),
    ),
  );

  return { cabecalhos, registros };
};

// 3. Funções auxiliares de normalização
const normalizarTexto = (valor) => {
  return String(valor ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ");
};

const normalizarPeriodo = (valor) => {
  const normalizado = normalizarTexto(valor)
    .replaceAll("-", "")
    .replaceAll(" ", "");

  const periodos = {
    MANHA: "manha",
    TARDE: "tarde",
    NOITE: "noite",
    INTEGRAL: "integral",
    ONLINE: "online",
  };

  return periodos[normalizado] ?? null;
};

const normalizarNomeComparacao = (nome) => {
  return normalizarTexto(nome)
    .replace(/\s*-\s*EAD\b/g, "")
    .replace(/\s*-\s*\d+%\s*ON\s*-?\s*LINE\b/g, "")
    .replace(/\s*-\s*\d+%\s*ONLINE\b/g, "")
    .trim();
};

// 4. Análise e aplicação das regras de negócio do CSV
export const analisarCsvAlunos = (registros, cursosExistentes = []) => {
  const candidatosValidos = [];
  let treineiros = 0;
  let invalidos = 0;
  const mapaCursos = new Map();

  registros.forEach((registro) => {
    const nomeAluno = registro.NOME.trim();
    const escolaridadeTxt = normalizarTexto(registro.ESCOLARIDADE);
    const cidadeAluno = registro.CIDADE.trim();
    const sexoAluno = normalizarTexto(registro.SEXO);
    const habilitacao = registro.HABILITACAO.trim();
    const periodo = normalizarPeriodo(registro.PERIODO);
    const classificacaoTxt = registro.CLASSIFICACAO.trim();
    const classificacao =
      classificacaoTxt === "" ? null : Number(classificacaoTxt);

    if (normalizarTexto(habilitacao) === "TREINEIRO") {
      treineiros += 1;
      return;
    }

    const escolaridadeValida =
      escolaridadeTxt === "SIM" ||
      escolaridadeTxt === "NAO" ||
      escolaridadeTxt === "NÃO";

    const classificacaoValida =
      classificacao === null || Number.isInteger(classificacao);

    const camposObrigatoriosPreenchidos =
      nomeAluno &&
      cidadeAluno &&
      sexoAluno &&
      habilitacao &&
      periodo;

    if (
      !camposObrigatoriosPreenchidos ||
      !escolaridadeValida ||
      !classificacaoValida
    ) {
      invalidos += 1;
      return;
    }

    const chaveCurso = normalizarNomeComparacao(habilitacao);

    candidatosValidos.push({
      nomeAluno,
      escolaridadePublica: escolaridadeTxt === "SIM",
      cidadeAluno,
      sexoAluno,
      chaveCurso,
      classificacao,
      periodo,
    });

    if (!mapaCursos.has(chaveCurso)) {
      mapaCursos.set(chaveCurso, {
        chave: chaveCurso,
        nomeCsv: habilitacao,
        periodos: new Set(),
        totalCandidatos: 0,
      });
    }

    const curso = mapaCursos.get(chaveCurso);
    curso.totalCandidatos += 1;
    if (periodo) {
      curso.periodos.add(periodo);
    }
  });

  const gruposCursos = Array.from(mapaCursos.values()).map((grupo) => {
    const matchNome = cursosExistentes.find(
      (c) =>
        normalizarNomeComparacao(c.nome) ===
        normalizarNomeComparacao(grupo.nomeCsv),
    );

    return {
      chave: grupo.chave,
      nomeCsv: grupo.nomeCsv,
      periodos: Array.from(grupo.periodos),
      totalCandidatos: grupo.totalCandidatos,
      idCurso: matchNome ? String(matchNome.id) : "",
      tipoAssociacao: matchNome ? "SUGESTAO" : "PENDENTE",
    };
  });

  return {
    totalLinhas: registros.length,
    candidatosValidos,
    gruposCursos,
    metricas: {
      validos: candidatosValidos.length,
      treineiros,
      invalidos,
    },
  };
};