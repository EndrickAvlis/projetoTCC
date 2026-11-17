import prisma from "../src/config/prisma.js";
import { formatarNome } from "../src/utils/formatarNome.js";

const SIMULAR = process.argv.includes("--simular");

const criarGerador = (semente) => {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const rand = criarGerador(20261117);
const inteiro = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const entre = (min, max) => min + rand() * (max - min);
const escolher = (lista) => lista[Math.floor(rand() * lista.length)];
const chance = (probabilidade) => rand() < probabilidade;
const moeda = (valor) => Math.round(valor * 100) / 100;

const embaralhar = (lista) => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

const sortearPeso = (opcoes) => {
  const total = opcoes.reduce((soma, opcao) => soma + opcao.peso, 0);
  let alvo = rand() * total;
  for (const opcao of opcoes) {
    alvo -= opcao.peso;
    if (alvo <= 0) return opcao.valor;
  }
  return opcoes.at(-1).valor;
};

const somar = (data, minutos) =>
  new Date(data.getTime() + Math.round(minutos * 60) * 1000);

const horario = (dia, hora, minuto, segundo = 0) => {
  const pad = (valor) => String(valor).padStart(2, "0");
  return new Date(`${dia}T${pad(hora)}:${pad(minuto)}:${pad(segundo)}-03:00`);
};

const fimDoDia = (dia) => new Date(`${dia}T23:59:59.999-03:00`);

const emLotes = async (lista, tamanho, executar) => {
  for (let i = 0; i < lista.length; i += tamanho) {
    await Promise.all(lista.slice(i, i + tamanho).map(executar));
  }
};

const ANO_PROCESSO = 2026;
const SEMESTRE_PROCESSO = 2;
const VAGAS_POR_PERIODO = 40;
const LIMITE_OCUPACAO = 36;

const DIAS_UTEIS = [
  "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06",
  "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13",
  "2026-11-16",
];
const DIAS_COM_RETIRADA_PENDENTE = new Set(DIAS_UTEIS.slice(-3));
const DIA_APRESENTACAO = "2026-11-17";

const CURSOS = [
  { nome: "Administração", periodos: [{ periodo: "manha", peso: 1.2 }, { periodo: "online", peso: 0.9 }] },
  { nome: "Comércio", periodos: [{ periodo: "online", peso: 0.8 }] },
  { nome: "Contabilidade", periodos: [{ periodo: "noite", peso: 1 }] },
  { nome: "Edificações", periodos: [{ periodo: "noite", peso: 1 }] },
  { nome: "Eletromecânica", periodos: [{ periodo: "noite", peso: 1 }] },
  { nome: "Enfermagem", periodos: [{ periodo: "noite", peso: 1.3 }] },
  { nome: "Guia de Turismo", periodos: [{ periodo: "online", peso: 0.7 }] },
  { nome: "Logística", periodos: [{ periodo: "tarde", peso: 1 }] },
  { nome: "Mecatrônica", periodos: [{ periodo: "integral", peso: 1.1 }] },
  { nome: "Prótese Dentária", periodos: [{ periodo: "noite", peso: 0.9 }] },
];

const UNIFORMES = [
  { nome: "P", preco: 45, entrada: 110, peso: 20 },
  { nome: "M", preco: 45, entrada: 190, peso: 35 },
  { nome: "G", preco: 45, entrada: 170, peso: 30 },
  { nome: "GG", preco: 50, entrada: 90, peso: 15 },
];
const ARMARIO = { nome: "Armário", preco: 10, entrada: 200 };

const DOCUMENTOS = [
  "RG_CIN",
  "CPF_CIN",
  "FOTO",
  "ESCOLARIDADE_PUBLICA",
  "HISTORICO_ENSINO_FUNDAMENTAL",
];

const FORMAS_PAGAMENTO = [
  { valor: "pix", peso: 42 },
  { valor: "dinheiro", peso: 24 },
  { valor: "debito", peso: 20 },
  { valor: "credito", peso: 14 },
];

const CANCELAMENTOS = [
  { valor: "nao_compareceu", peso: 25 },
  { valor: "desistiu_triagem", peso: 15 },
  { valor: "pendencia", peso: 35 },
  { valor: "desistiu_apm", peso: 25 },
];

const CIDADES = [
  "São José do Rio Preto", "São José do Rio Preto", "São José do Rio Preto",
  "Mirassol", "Bady Bassitt", "Cedral", "Guapiaçu", "Tanabi", "José Bonifácio",
  "Potirendaba", "Nova Granada", "Monte Aprazível", "Neves Paulista", "Uchoa",
  "Olímpia", "Catanduva", "Votuporanga", "Ipiguá", "Adolfo", "Onda Verde",
];

const NOMES_MASCULINOS = [
  "Arthur", "Bernardo", "Bruno", "Caio", "Cauã", "Daniel", "Davi", "Diego",
  "Eduardo", "Enzo", "Felipe", "Gabriel", "Guilherme", "Gustavo", "Heitor",
  "Henrique", "Igor", "João Pedro", "João Vitor", "Kauã", "Leonardo", "Lucas",
  "Luiz Otávio", "Matheus", "Miguel", "Murilo", "Nicolas", "Otávio", "Pedro",
  "Rafael", "Renan", "Rodrigo", "Samuel", "Thiago", "Vinícius", "Vitor", "Yuri",
];

const NOMES_FEMININOS = [
  "Alice", "Amanda", "Ana Clara", "Ana Júlia", "Beatriz", "Bianca", "Camila",
  "Carolina", "Clara", "Eduarda", "Emanuelly", "Fernanda", "Gabriela",
  "Giovanna", "Helena", "Heloísa", "Isabela", "Isadora", "Júlia", "Lara",
  "Larissa", "Laura", "Letícia", "Lívia", "Lorena", "Luana", "Manuela",
  "Maria Eduarda", "Maria Luiza", "Mariana", "Melissa", "Nicole", "Rafaela",
  "Sofia", "Stella", "Valentina", "Yasmin",
];

const SOBRENOMES = [
  "Almeida", "Alves", "Andrade", "Araújo", "Barbosa", "Barros", "Batista",
  "Borges", "Campos", "Cardoso", "Carvalho", "Castro", "Cavalcante", "Costa",
  "Dias", "Duarte", "Ferreira", "Freitas", "Gomes", "Gonçalves", "Lima",
  "Lopes", "Machado", "Marques", "Martins", "Mendes", "Monteiro", "Moraes",
  "Moreira", "Moura", "Nascimento", "Nogueira", "Nunes", "Oliveira", "Pereira",
  "Pinto", "Ramos", "Reis", "Ribeiro", "Rocha", "Rodrigues", "Santana",
  "Santos", "Silva", "Soares", "Souza", "Teixeira", "Vieira", "Zanetti",
  "Bertolini", "Fernandes", "Galvão", "Rezende", "Toledo",
];

const CANDIDATOS_SALA = [
  { nome: "Anna Vitória Gonçalves Gomes", escolaridadePublica: true, cidade: "Mirassol", sexo: "FEMININO" },
  { nome: "Caio Vicensoto", escolaridadePublica: false, cidade: "Tanabi", sexo: "MASCULINO" },
  { nome: "Carlos Alves Barbosa", escolaridadePublica: true, cidade: "Bady Bassitt", sexo: "MASCULINO" },
  { nome: "Davi Prado Prates", escolaridadePublica: false, cidade: "Guapiaçu", sexo: "MASCULINO" },
  { nome: "Denis Eduardo Muniz Pedroso", escolaridadePublica: true, cidade: "Votuporanga", sexo: "MASCULINO" },
  { nome: "Endrick Silva Souza", escolaridadePublica: true, cidade: "Potirendaba", sexo: "MASCULINO" },
  { nome: "Enzo Antonio Valentim da Costa", escolaridadePublica: false, cidade: "Monte Aprazível", sexo: "MASCULINO" },
  { nome: "Felipe Tertuliano Venturini", escolaridadePublica: true, cidade: "Catanduva", sexo: "MASCULINO" },
  { nome: "Filipe Schimidt Leite", escolaridadePublica: false, cidade: "Olímpia", sexo: "MASCULINO" },
  { nome: "Gabriel Mori Feltran", escolaridadePublica: true, cidade: "José Bonifácio", sexo: "MASCULINO" },
  { nome: "Gustavo Alves Barboza Pereira", escolaridadePublica: true, cidade: "Neves Paulista", sexo: "MASCULINO" },
  { nome: "Heitor Gélio Pazote", escolaridadePublica: false, cidade: "Uchoa", sexo: "MASCULINO" },
  { nome: "Heitor Reis Ricci", escolaridadePublica: true, cidade: "Nova Granada", sexo: "MASCULINO" },
  { nome: "Juliana de Araujo", escolaridadePublica: true, cidade: "São José do Rio Preto", sexo: "FEMININO" },
  { nome: "Kaio Cyrino Moreira", escolaridadePublica: false, cidade: "Adolfo", sexo: "MASCULINO" },
  { nome: "Luan Henrique Evangelista", escolaridadePublica: true, cidade: "Mirassol", sexo: "MASCULINO" },
  { nome: "Luana Thauany da Silva Marques", escolaridadePublica: true, cidade: "Tanabi", sexo: "FEMININO" },
  { nome: "Marcos Feliphe Corrêa Martins", escolaridadePublica: false, cidade: "Cedral", sexo: "MASCULINO" },
  { nome: "Matheus Sales Pedrosa", escolaridadePublica: true, cidade: "Bady Bassitt", sexo: "MASCULINO" },
  { nome: "Nathan Lima Gasparoti", escolaridadePublica: true, cidade: "Votuporanga", sexo: "MASCULINO" },
  { nome: "Nicolas de Barros Andrade", escolaridadePublica: false, cidade: "Guapiaçu", sexo: "MASCULINO" },
  { nome: "Pedro Otávio de Campos Oliveira", escolaridadePublica: true, cidade: "Potirendaba", sexo: "MASCULINO" },
  { nome: "Rebeca Westpal Fadil", escolaridadePublica: false, cidade: "Catanduva", sexo: "FEMININO" },
  { nome: "Ryan da Silva Augusto", escolaridadePublica: true, cidade: "Monte Aprazível", sexo: "MASCULINO" },
  { nome: "Thales Carvalho Furlan", escolaridadePublica: false, cidade: "José Bonifácio", sexo: "MASCULINO" },
  { nome: "Thiago Mazzini", escolaridadePublica: true, cidade: "Neves Paulista", sexo: "MASCULINO" },
  { nome: "Victor Gabriel Barreto", escolaridadePublica: false, cidade: "Nova Granada", sexo: "MASCULINO" },
  { nome: "Victória Mesquita Barreto de Miranda Ferreira", escolaridadePublica: true, cidade: "São José do Rio Preto", sexo: "FEMININO" },
];

const NOMES_CSV_DEMONSTRACAO = new Set([
  "ANDREW HENRIQUE DE AQUINO PIEDADE",
  "DANIEL MURAKAMI TOSCANO MARTINS",
  "PEDRO MIGUEL DOS SANTOS MOURA",
  ...CANDIDATOS_SALA.map((c) => c.nome.toUpperCase()),
]);

const OFERTAS = CURSOS.flatMap((curso) =>
  curso.periodos.map(({ periodo, peso }) => ({
    chave: `${curso.nome}:${periodo}`,
    curso: curso.nome,
    periodo,
    peso,
  })),
);

const ocupacaoPorOferta = new Map(OFERTAS.map((oferta) => [oferta.chave, 0]));
const nomesUsados = new Set(NOMES_CSV_DEMONSTRACAO);
const alunosPlanejados = [];

const gerarNome = (sexo) => {
  const primeiros =
    sexo === "FEMININO"
      ? NOMES_FEMININOS
      : sexo === "MASCULINO"
        ? NOMES_MASCULINOS
        : [...NOMES_MASCULINOS, ...NOMES_FEMININOS];

  let nome = "";
  do {
    const [primeiroSobrenome, segundoSobrenome] = embaralhar(SOBRENOMES);
    const sobrenomes = chance(0.75)
      ? `${primeiroSobrenome} ${segundoSobrenome}`
      : primeiroSobrenome;
    const conector = chance(0.12) ? `${escolher(["de", "da", "dos"])} ` : "";
    nome = formatarNome(`${escolher(primeiros)} ${conector}${sobrenomes}`);
  } while (nomesUsados.has(nome.toUpperCase()));

  nomesUsados.add(nome.toUpperCase());
  return nome;
};

const planejarAluno = () => {
  const disponiveis = OFERTAS.filter(
    (oferta) => ocupacaoPorOferta.get(oferta.chave) < LIMITE_OCUPACAO,
  );
  const oferta = sortearPeso(disponiveis.map((o) => ({ valor: o, peso: o.peso })));
  ocupacaoPorOferta.set(oferta.chave, ocupacaoPorOferta.get(oferta.chave) + 1);

  const sexo = sortearPeso([
    { valor: "FEMININO", peso: 49 },
    { valor: "MASCULINO", peso: 49 },
    { valor: "OUTRO", peso: 2 },
  ]);

  const aluno = {
    nome: gerarNome(sexo),
    sexo,
    cidade: escolher(CIDADES),
    escolaridadePublica: chance(0.7),
    oferta,
    anoEscolar: sortearPeso([
      { valor: 1, peso: 30 },
      { valor: 2, peso: 35 },
      { valor: 3, peso: 35 },
    ]),
    classificacao: null,
    ativo: false,
    id: null,
  };

  alunosPlanejados.push(aluno);
  return aluno;
};

const distribuirClassificacoes = () => {
  const porOferta = new Map();
  for (const aluno of alunosPlanejados) {
    const lista = porOferta.get(aluno.oferta.chave) ?? [];
    lista.push(aluno);
    porOferta.set(aluno.oferta.chave, lista);
  }

  for (const alunos of porOferta.values()) {
    const posicoes = embaralhar(alunos.map((_, indice) => indice + 1));
    alunos.forEach((aluno, indice) => {
      aluno.classificacao = posicoes[indice];
    });
  }
};

const dividirPagamento = (total) => {
  if (total >= 40 && chance(0.12)) {
    const primeiraParte = escolher([10, 20, 30].filter((valor) => valor < total));
    const primeiraForma = sortearPeso(FORMAS_PAGAMENTO);
    let segundaForma = primeiraForma;
    while (segundaForma === primeiraForma) {
      segundaForma = sortearPeso(FORMAS_PAGAMENTO);
    }
    return [
      { tipo: primeiraForma, valor: primeiraParte },
      { tipo: segundaForma, valor: moeda(total - primeiraParte) },
    ];
  }
  return [{ tipo: sortearPeso(FORMAS_PAGAMENTO), valor: total }];
};

const montarCompra = ({ uniformes, armario, contribuicao, dataHora, voluntario }) => {
  const valorUniformes = uniformes.reduce((soma, item) => {
    const preco = UNIFORMES.find((u) => u.nome === item.tamanho).preco;
    return moeda(soma + preco * item.quantidade);
  }, 0);
  const total = moeda(valorUniformes + (armario ? ARMARIO.preco : 0) + contribuicao);
  if (total <= 0) return null;

  return {
    uniformes,
    armario,
    contribuicao,
    total,
    pagamentos: dividirPagamento(total),
    dataHora,
    voluntario,
  };
};

const planejarCompra = ({ dataHora, voluntario, retiradaPendente }) => {
  const quantidades = new Map();
  if (chance(0.78)) {
    const pecas = sortearPeso([
      { valor: 1, peso: 50 },
      { valor: 2, peso: 38 },
      { valor: 3, peso: 12 },
    ]);
    const tamanhoBase = sortearPeso(UNIFORMES.map((u) => ({ valor: u.nome, peso: u.peso })));
    for (let i = 0; i < pecas; i++) {
      const tamanho = chance(0.85)
        ? tamanhoBase
        : sortearPeso(UNIFORMES.map((u) => ({ valor: u.nome, peso: u.peso })));
      quantidades.set(tamanho, (quantidades.get(tamanho) ?? 0) + 1);
    }
  }

  const uniformes = [...quantidades].map(([tamanho, quantidade]) => {
    let retirada = quantidade;
    if (retiradaPendente) {
      const sorteio = rand();
      if (sorteio < 0.18) retirada = 0;
      else if (sorteio < 0.26 && quantidade > 1) retirada = quantidade - 1;
    }
    return { tamanho, quantidade, retirada };
  });

  const contribuicao = chance(0.6)
    ? sortearPeso([
        { valor: 5, peso: 12 },
        { valor: 7.5, peso: 2 },
        { valor: 10, peso: 28 },
        { valor: 15, peso: 12 },
        { valor: 20, peso: 22 },
        { valor: 25, peso: 6 },
        { valor: 30, peso: 8 },
        { valor: 50, peso: 8 },
        { valor: 100, peso: 2 },
      ])
    : 0;

  return montarCompra({
    uniformes,
    armario: chance(0.42),
    contribuicao,
    dataHora,
    voluntario,
  });
};

const criarGuiches = (voluntarios, dia) =>
  voluntarios.map((voluntario) => ({ voluntario, livreEm: horario(dia, 8, 0) }));

const chamarProxima = (guiches, prontaEm) => {
  const guiche = guiches.reduce((a, b) => (a.livreEm <= b.livreEm ? a : b));
  const chamadaEm = somar(
    new Date(Math.max(prontaEm.getTime(), guiche.livreEm.getTime())),
    entre(0.3, 1),
  );
  return { guiche, chamadaEm, inicio: somar(chamadaEm, entre(0.4, 1.2)) };
};

const registrarHistorico = (senha, guiche, etapa, inicio, fim) => {
  senha.historicos.push({ voluntario: guiche.voluntario, etapa, inicio, fim });
  guiche.livreEm = fim;
};

const sortearDocumentosPendentes = () => {
  const quantidade = sortearPeso([
    { valor: 1, peso: 55 },
    { valor: 2, peso: 35 },
    { valor: 3, peso: 10 },
  ]);
  const selecionados = new Set(embaralhar(DOCUMENTOS).slice(0, quantidade));
  return DOCUMENTOS.filter((documento) => selecionados.has(documento));
};

const planejarDia = (dia, equipe) => {
  const finalizadas = 30 + inteiro(-3, 3);
  const canceladas = 5 + inteiro(-3, 3);
  const desfechos = embaralhar([
    ...Array(finalizadas).fill("finalizada"),
    ...Array.from({ length: canceladas }, () => sortearPeso(CANCELAMENTOS)),
  ]);

  const abertura = horario(dia, 8, 0);
  const emissoes = desfechos.map(() => entre(0, 479.5)).sort((a, b) => a - b);

  const senhas = desfechos.map((desfecho, indice) => ({
    dia,
    codigo: indice + 1,
    emitidaEm: somar(abertura, emissoes[indice]),
    prioritaria: chance(0.08),
    desfecho,
    retornaDePendencia: desfecho === "finalizada" && chance(0.04),
    etapa: "triagem",
    status: "aguardando",
    encerradaEm: null,
    documentos: null,
    aluno: null,
    historicos: [],
    compra: null,
  }));

  const triagem = criarGuiches(equipe.triagem, dia);
  const apm = criarGuiches(equipe.apm, dia);
  const docs = criarGuiches(equipe.docs, dia);
  const supervisao = criarGuiches([equipe.supervisor], dia);

  for (const senha of senhas) {
    const { guiche, chamadaEm, inicio } = chamarProxima(triagem, senha.emitidaEm);

    if (senha.desfecho === "nao_compareceu") {
      const fim = somar(chamadaEm, entre(2, 4));
      registrarHistorico(senha, guiche, "triagem", null, fim);
      Object.assign(senha, { status: "cancelada", encerradaEm: fim });
      continue;
    }

    if (senha.desfecho === "desistiu_triagem") {
      const fim = somar(inicio, entre(2, 5));
      registrarHistorico(senha, guiche, "triagem", inicio, fim);
      Object.assign(senha, { status: "cancelada", encerradaEm: fim });
      continue;
    }

    const fim = somar(inicio, entre(3.5, 6.5));
    registrarHistorico(senha, guiche, "triagem", inicio, fim);
    senha.aluno = planejarAluno();

    if (senha.desfecho === "pendencia") {
      Object.assign(senha, {
        status: "cancelada",
        encerradaEm: fimDoDia(dia),
        documentos: {
          documentos: sortearDocumentosPendentes(),
          registradaEm: fim.toISOString(),
        },
      });
      continue;
    }

    senha.documentos = { documentos: [] };
    if (senha.retornaDePendencia) senha.retornoEm = somar(fim, entre(20, 45));
    else senha.prontaApm = fim;
  }

  senhas
    .filter((senha) => senha.retornaDePendencia)
    .sort((a, b) => a.retornoEm - b.retornoEm)
    .forEach((senha) => {
      const guiche = supervisao[0];
      const inicio = new Date(Math.max(senha.retornoEm.getTime(), guiche.livreEm.getTime()));
      const fim = somar(inicio, entre(2, 4));
      registrarHistorico(senha, guiche, "triagem", inicio, fim);
      senha.prontaApm = fim;
    });

  senhas
    .filter((senha) => senha.prontaApm)
    .sort((a, b) => a.prontaApm - b.prontaApm)
    .forEach((senha) => {
      const { guiche, chamadaEm, inicio } = chamarProxima(apm, senha.prontaApm);
      senha.etapa = "apm";

      if (senha.desfecho === "desistiu_apm") {
        const fim = somar(chamadaEm, entre(2, 4));
        registrarHistorico(senha, guiche, "apm", null, fim);
        Object.assign(senha, { status: "cancelada", encerradaEm: fim });
        return;
      }

      const fim = somar(inicio, entre(3, 6));
      registrarHistorico(senha, guiche, "apm", inicio, fim);
      senha.compra = planejarCompra({
        dataHora: somar(fim, -entre(0.3, 0.8)),
        voluntario: guiche.voluntario,
        retiradaPendente: DIAS_COM_RETIRADA_PENDENTE.has(dia),
      });
      senha.prontaDocs = fim;
    });

  senhas
    .filter((senha) => senha.prontaDocs)
    .sort((a, b) => a.prontaDocs - b.prontaDocs)
    .forEach((senha) => {
      const { guiche, inicio } = chamarProxima(docs, senha.prontaDocs);
      const fim = somar(inicio, entre(2.5, 5));
      registrarHistorico(senha, guiche, "docs", inicio, fim);
      Object.assign(senha, { etapa: "docs", status: "finalizada", encerradaEm: fim });
      senha.aluno.ativo = true;
    });

  return senhas;
};

const planejarApresentacao = (equipe) => {
  const dia = DIA_APRESENTACAO;
  const nova = (codigo, emitidaEm, prioritaria = false) => ({
    dia,
    codigo,
    emitidaEm,
    prioritaria,
    etapa: "triagem",
    status: "aguardando",
    encerradaEm: null,
    documentos: null,
    aluno: null,
    historicos: [],
    compra: null,
  });
  const historico = (voluntario, etapa, inicio, fim) => ({ voluntario, etapa, inicio, fim });

  const naDocs = nova(1, horario(dia, 7, 31, 12));
  naDocs.aluno = planejarAluno();
  naDocs.historicos.push(
    historico(equipe.triagem[0], "triagem", horario(dia, 7, 32, 5), horario(dia, 7, 37, 48)),
    historico(equipe.apm[0], "apm", horario(dia, 7, 39, 2), horario(dia, 7, 44, 30)),
  );
  naDocs.compra = montarCompra({
    uniformes: [{ tamanho: "M", quantidade: 2, retirada: 2 }],
    armario: true,
    contribuicao: 20,
    dataHora: horario(dia, 7, 43, 58),
    voluntario: equipe.apm[0],
  });
  naDocs.compra.pagamentos = [{ tipo: "pix", valor: naDocs.compra.total }];
  Object.assign(naDocs, { etapa: "docs", documentos: { documentos: [] } });

  const pendencia = nova(2, horario(dia, 7, 34, 40));
  pendencia.aluno = planejarAluno();
  pendencia.historicos.push(
    historico(equipe.triagem[1], "triagem", horario(dia, 7, 35, 20), horario(dia, 7, 42, 15)),
  );
  Object.assign(pendencia, {
    status: "pendente",
    documentos: {
      documentos: ["FOTO", "HISTORICO_ENSINO_FUNDAMENTAL"],
      registradaEm: horario(dia, 7, 42, 15).toISOString(),
    },
  });

  const naApm = [
    { codigo: 3, emitida: [7, 38, 55], inicio: [7, 39, 30], fim: [7, 45, 10], voluntario: equipe.triagem[0] },
    { codigo: 4, emitida: [7, 43, 20], inicio: [7, 44, 5], fim: [7, 50, 40], voluntario: equipe.triagem[1] },
  ].map(({ codigo, emitida, inicio, fim, voluntario }) => {
    const senha = nova(codigo, horario(dia, ...emitida));
    senha.aluno = planejarAluno();
    senha.historicos.push(historico(voluntario, "triagem", horario(dia, ...inicio), horario(dia, ...fim)));
    return Object.assign(senha, { etapa: "apm", documentos: { documentos: [] } });
  });

  const recemEmitidas = [
    nova(5, horario(dia, 7, 51, 30)),
    nova(6, horario(dia, 7, 54, 10), true),
    nova(7, horario(dia, 7, 57, 45)),
  ];

  return [naDocs, pendencia, ...naApm, ...recemEmitidas];
};

const montarEquipes = (voluntarios) => {
  const ativos = voluntarios.filter((v) => v.statusVoluntario);
  if (ativos.length === 0) throw new Error("Nenhum usuário ativo encontrado.");

  const porNome = (nome) =>
    ativos.find((v) => v.nomeVoluntario.toLowerCase() === nome) ?? ativos[0];

  return {
    triagem: [porNome("triagem"), porNome("atendente")],
    apmFixo: porNome("apm"),
    apmApoio: [porNome("mori"), porNome("schimidt")],
    docsFixo: porNome("docs"),
    docsApoio: porNome("endrick"),
    supervisor: porNome("supervisor"),
  };
};

const equipeDoDia = (equipes) => ({
  triagem: equipes.triagem,
  apm: [equipes.apmFixo, escolher(equipes.apmApoio)],
  docs: chance(0.5) ? [equipes.docsFixo, equipes.docsApoio] : [equipes.docsFixo],
  supervisor: equipes.supervisor,
});

const limparDados = () =>
  prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "HistoricoSenha",
      "ItemCompra",
      "Pagamento",
      "Contribuicao",
      "Compra",
      "Senha",
      "CursoAluno",
      "Aluno",
      "PeriodoCurso",
      "Curso",
      "Produto"
    RESTART IDENTITY
  `);

const calcularRetiradas = (senhas) => {
  const retiradas = new Map([...UNIFORMES.map((u) => [u.nome, 0]), [ARMARIO.nome, 0]]);
  for (const { compra } of senhas) {
    if (!compra) continue;
    for (const item of compra.uniformes) {
      retiradas.set(item.tamanho, retiradas.get(item.tamanho) + item.retirada);
    }
    if (compra.armario) retiradas.set(ARMARIO.nome, retiradas.get(ARMARIO.nome) + 1);
  }
  return retiradas;
};

const persistir = async (senhas) => {
  await limparDados();

  const cursosCriados = await Promise.all(
    CURSOS.map((curso) =>
      prisma.curso.create({
        data: {
          nomeCurso: curso.nome,
          periodos: {
            create: curso.periodos.map(({ periodo }) => ({
              periodo,
              vagasTotais: VAGAS_POR_PERIODO,
              matriculaAtiva: true,
            })),
          },
        },
      }),
    ),
  );
  const idCurso = new Map(cursosCriados.map((c) => [c.nomeCurso, c.idCurso]));

  const retiradas = calcularRetiradas(senhas);
  const produtos = await Promise.all(
    [
      ...UNIFORMES.map((u) => ({ ...u, tipo: "uniforme" })),
      { ...ARMARIO, tipo: "armario" },
    ].map((produto) =>
      prisma.produto.create({
        data: {
          nomeProduto: produto.nome,
          precoProduto: produto.preco,
          quantidadeProduto: produto.entrada - retiradas.get(produto.nome),
          tipoProduto: produto.tipo,
          statusProduto: true,
        },
      }),
    ),
  );
  const idProduto = new Map(produtos.map((p) => [p.nomeProduto, p.idProduto]));

  await emLotes(alunosPlanejados, 10, async (aluno) => {
    const criado = await prisma.aluno.create({
      data: {
        nomeAluno: aluno.nome,
        escolaridadePublica: aluno.escolaridadePublica,
        cidadeAluno: aluno.cidade,
        sexoAluno: aluno.sexo,
        statusAluno: aluno.ativo ? "ATIVO" : "CANDIDATO",
        anoProcesso: ANO_PROCESSO,
        semestreProcesso: SEMESTRE_PROCESSO,
        cursosAluno: {
          create: {
            codCurso: idCurso.get(aluno.oferta.curso),
            periodo: aluno.oferta.periodo,
            classificacao: aluno.classificacao,
            anoEscolar: aluno.anoEscolar,
            statusMatricula: aluno.ativo ? "ATIVA" : "PENDENTE",
          },
        },
      },
    });
    aluno.id = criado.idAluno;
  });

  await emLotes(senhas, 10, (senha) =>
    prisma.senha.create({
      data: {
        codAluno: senha.aluno?.id ?? null,
        senhaCodigo: senha.codigo,
        dataHoraInicioSenha: senha.emitidaEm,
        dataHoraFimSenha: senha.encerradaEm,
        etapaSenha: senha.etapa,
        tipoSenha: senha.prioritaria,
        statusSenha: senha.status,
        documentosPendentes: senha.documentos ?? undefined,
        historicos: {
          create: senha.historicos.map((h) => ({
            codVoluntario: h.voluntario.idVoluntario,
            etapaHistorico: h.etapa,
            dataHoraInicioHistorico: h.inicio,
            dataHoraFimHistorico: h.fim,
          })),
        },
      },
    }),
  );

  const codigosUsados = new Set();
  const gerarCodigoRetirada = () => {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    do {
      codigo = `RET-${Array.from({ length: 7 }, () => escolher([...caracteres])).join("")}`;
    } while (codigosUsados.has(codigo));
    codigosUsados.add(codigo);
    return codigo;
  };

  const vendas = senhas.filter((senha) => senha.compra);
  await emLotes(vendas, 10, ({ aluno, compra }) => {
    const itens = compra.uniformes.map((item) => ({
      codProduto: idProduto.get(item.tamanho),
      precoUnitario: UNIFORMES.find((u) => u.nome === item.tamanho).preco,
      quantidadeItem: item.quantidade,
      quantidadeRetiradaItem: item.retirada,
      statusItem:
        item.retirada === item.quantidade
          ? "retirado"
          : item.retirada === 0
            ? "pendente"
            : "parcial",
    }));
    if (compra.armario) {
      itens.push({
        codProduto: idProduto.get(ARMARIO.nome),
        precoUnitario: ARMARIO.preco,
        quantidadeItem: 1,
        quantidadeRetiradaItem: 1,
        statusItem: "retirado",
      });
    }

    return prisma.compra.create({
      data: {
        codVoluntario: compra.voluntario.idVoluntario,
        codAluno: aluno.id,
        valorCompra: compra.total,
        dataHoraCompra: compra.dataHora,
        codigoRetirada: gerarCodigoRetirada(),
        itensCompra: itens.length ? { create: itens } : undefined,
        pagamentos: {
          create: compra.pagamentos.map((p) => ({
            valorPagamento: p.valor,
            tipoPagamento: p.tipo,
          })),
        },
        contribuicoes:
          compra.contribuicao > 0
            ? { create: { valorContribuicao: compra.contribuicao, dataHora: compra.dataHora } }
            : undefined,
      },
    });
  });
};

const resumir = (senhas) => {
  const passadas = senhas.filter((senha) => senha.dia !== DIA_APRESENTACAO);
  const finalizadas = passadas.filter((senha) => senha.status === "finalizada");
  const tempoMedio =
    finalizadas.reduce((soma, s) => soma + (s.encerradaEm - s.emitidaEm), 0) /
    finalizadas.length /
    60000;

  const porDia = DIAS_UTEIS.map((dia) => {
    const doDia = passadas.filter((senha) => senha.dia === dia);
    return {
      dia,
      emitidas: doDia.length,
      finalizadas: doDia.filter((s) => s.status === "finalizada").length,
      canceladas: doDia.filter((s) => s.status === "cancelada").length,
    };
  });

  const retiradas = calcularRetiradas(senhas);
  return {
    tempoMedioMinutos: Number(tempoMedio.toFixed(1)),
    porDia,
    alunos: alunosPlanejados.length,
    alunosAtivos: alunosPlanejados.filter((a) => a.ativo).length,
    vendas: senhas.filter((s) => s.compra).length,
    estoqueFinal: Object.fromEntries(
      [...UNIFORMES, ARMARIO].map((p) => [p.nome, p.entrada - retiradas.get(p.nome)]),
    ),
    ocupacao: Object.fromEntries(ocupacaoPorOferta),
  };
};

const aplicarCandidatosDaSala = () => {
  const candidatos = alunosPlanejados.filter((aluno) => !aluno.ativo);
  CANDIDATOS_SALA.forEach((dados, indice) => {
    if (candidatos[indice]) Object.assign(candidatos[indice], dados);
  });
};

const executar = async () => {
  const voluntarios = await prisma.voluntario.findMany();
  const equipes = montarEquipes(voluntarios);

  const senhas = [
    ...DIAS_UTEIS.flatMap((dia) => planejarDia(dia, equipeDoDia(equipes))),
    ...planejarApresentacao(equipeDoDia(equipes)),
  ];
  aplicarCandidatosDaSala();
  distribuirClassificacoes();

  if (!SIMULAR) await persistir(senhas);
  return resumir(senhas);
};

executar()
  .then((resumo) => process.stdout.write(`${JSON.stringify(resumo, null, 2)}\n`))
  .finally(() => prisma.$disconnect());
