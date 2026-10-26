import BaseService from "./baseService.js";
import prisma from "../config/prisma.js";

const obterFimDoDia = (data) => {
  const d = new Date(data);
  d.setHours(23, 59, 59, 999);
  return d;
};

const obterInicioDoDia = (data) => {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
};

const calcularIntervaloDatas = (periodo, inicioParam, fimParam) => {
  if (periodo === "PERSONALIZADO" && inicioParam && fimParam) {
    return {
      inicio: new Date(`${inicioParam}T00:00:00.000Z`),
      fim: new Date(`${fimParam}T23:59:59.999Z`),
    };
  }

  const agora = new Date();
  let inicio = obterInicioDoDia(agora);
  const fim = obterFimDoDia(agora);

  if (periodo === "SEMANA") {
    const distanciaSegunda = (inicio.getUTCDay() + 6) % 7;
    inicio.setUTCDate(inicio.getUTCDate() - distanciaSegunda);
  } else if (periodo === "MES") {
    inicio.setUTCDate(1);
  }

  return { inicio, fim };
};

const montarFiltrosWhere = ({
  periodo,
  dataInicio,
  dataFim,
  cursoId,
  formaPagamento,
  tipoReceita,
  atendenteId,
}) => {
  const { inicio, fim } = calcularIntervaloDatas(periodo, dataInicio, dataFim);
  const where = { dataHoraCompra: { gte: inicio, lte: fim } };

  if (cursoId) {
    where.aluno = { cursosAluno: { some: { codCurso: Number(cursoId) } } };
  }
  if (formaPagamento) {
    where.pagamentos = { some: { tipoPagamento: formaPagamento } };
  }
  if (atendenteId) {
    where.codVoluntario = Number(atendenteId);
  }

  if (tipoReceita === "contribuicao") {
    where.contribuicoes = { some: {} };
  } else if (tipoReceita) {
    where.itensCompra = { some: { produto: { tipoProduto: tipoReceita } } };
  }

  return where;
};

const mapearVenda = (compra) => {
  const matricula = compra.aluno?.cursosAluno?.[0];

  const quantidadeItens = compra.itensCompra.reduce(
    (total, i) => total + i.quantidadeItem,
    0,
  );

  const contribuicao = compra.contribuicoes.reduce(
    (total, c) => total + Number(c.valorContribuicao),
    0,
  );

  const formaPagamento = compra.pagamentos
    .map((p) => p.tipoPagamento)
    .join(", ");

  return {
    id: compra.idCompra,
    codigoRetirada: compra.codigoRetirada,
    dataHora: compra.dataHoraCompra,
    aluno: compra.aluno?.nomeAluno,
    curso: matricula?.curso?.nomeCurso,
    periodo: matricula?.periodo,
    atendente: compra.voluntario?.nomeVoluntario,
    formaPagamento,
    quantidadeItens,
    contribuicao,
    precoTotal: Number(compra.valorCompra),
  };
};

export default class RelatorioService extends BaseService {
  constructor() {
    super(prisma.compra, "idCompra");
  }

  async buscarVendasParaExportar(filtros = {}) {
    const compras = await prisma.compra.findMany({
      where: montarFiltrosWhere(filtros),
      include: {
        aluno: {
          include: {
            cursosAluno: {
              include: { curso: true },
              take: 1,
            },
          },
        },
        voluntario: true,
        itensCompra: {
          include: { produto: true },
        },
        pagamentos: true,
        contribuicoes: true,
      },
      orderBy: { dataHoraCompra: "desc" },
    });

    return compras.map(mapearVenda);
  }
}
