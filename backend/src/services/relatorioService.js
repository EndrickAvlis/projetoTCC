
import BaseService from "./baseService.js";
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import { intervaloPeriodo } from "./dashboardService.js";

const montarFiltrosWhere = ({
  periodo,
  dataInicio,
  dataFim,
  cursoId,
  formaPagamento,
  tipoReceita,
  atendenteId,
}) => {
  const intervalo = intervaloPeriodo({ periodo, dataInicio, dataFim });

  const where = intervalo
    ? { dataHoraCompra: intervalo }
    : {};

  if (cursoId) {
    where.aluno = {
      cursosAluno: {
        some: {
          codCurso: Number(cursoId),
        },
      },
    };
  }

  if (formaPagamento) {
    where.pagamentos = {
      some: {
        tipoPagamento: formaPagamento,
      },
    };
  }

  if (atendenteId) {
    where.codVoluntario = Number(atendenteId);
  }

  if (tipoReceita === "contribuicao") {
    where.contribuicoes = { some: {} };
  } else if (tipoReceita) {
    where.itensCompra = {
      some: {
        produto: {
          tipoProduto: tipoReceita,
        },
      },
    };
  }

  return where;
};

const mapearVenda = (compra) => {
  const matricula = compra.aluno?.cursosAluno?.[0];

  const quantidadeItens = compra.itensCompra.reduce(
    (total, item) => total + item.quantidadeItem,
    0,
  );

  const contribuicao = compra.contribuicoes.reduce(
    (total, item) => total + Number(item.valorContribuicao),
    0,
  );

  const formaPagamento = compra.pagamentos
    .map((pagamento) => pagamento.tipoPagamento)
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

  async obterDadosRelatorio(filtros = {}) {
    const where = montarFiltrosWhere(filtros);

    const pagina = Number(filtros.pagina || 1);
    const limite = Number(filtros.limite || 10);

    const [totalVendas, compras, todasCompras] =
      await Promise.all([
        prisma.compra.count({ where }),

        prisma.compra.findMany({
          where,
          include: {
            aluno: true,
            itensCompra: true,
          },
          orderBy: [
            { dataHoraCompra: "desc" },
            { idCompra: "desc" },
          ],
          skip: (pagina - 1) * limite,
          take: limite,
        }),

        prisma.compra.findMany({
          where,
          include: {
            itensCompra: {
              include: { produto: true },
            },
            pagamentos: true,
            contribuicoes: true,
          },
        }),
      ]);

    const porCategoria = {
      uniformes: { valor: 0, quantidade: 0 },
      armarios: { valor: 0, quantidade: 0 },
      contribuicao: { valor: 0, quantidade: 0 },
    };

    const porPagamento = {
      dinheiro: 0,
      pix: 0,
      debito: 0,
      credito: 0,
    };

    let totalArrecadado = 0;

    for (const compra of todasCompras) {
      totalArrecadado += Number(compra.valorCompra);

      for (const item of compra.itensCompra) {
        const tipo = item.produto?.tipoProduto;

        if (tipo === "uniforme" || tipo === "armario") {
          const categoria =
            tipo === "uniforme"
              ? porCategoria.uniformes
              : porCategoria.armarios;

          categoria.valor +=
            Number(item.precoUnitario) * item.quantidadeItem;

          categoria.quantidade += item.quantidadeItem;
        }
      }

      for (const contribuicao of compra.contribuicoes) {
        porCategoria.contribuicao.valor +=
          Number(contribuicao.valorContribuicao);

        porCategoria.contribuicao.quantidade++;
      }

      for (const pagamento of compra.pagamentos) {
        const tipo = pagamento.tipoPagamento;

        if (tipo in porPagamento) {
          porPagamento[tipo] +=
            Number(pagamento.valorPagamento);
        }
      }
    }

    return {
      resumoReceita: {
        totais: {
          totalArrecadado,
          totalVendas,
          ticketMedio: totalVendas
            ? totalArrecadado / totalVendas
            : 0,
        },
        porCategoria,
        porPagamento,
      },

      vendas: compras.map((compra) => ({
        id: compra.idCompra,
        dataHora: compra.dataHoraCompra,
        aluno: compra.aluno?.nomeAluno ?? null,
        quantidadeItens: compra.itensCompra.reduce(
          (total, item) => total + item.quantidadeItem,
          0,
        ),
        precoTotal: Number(compra.valorCompra),
      })),

      totalVendas,
      pagina,
      totalPaginas: Math.ceil(totalVendas / limite),
    };
  }

  async obterDetalhesVenda(id) {
    const compra = await prisma.compra.findUnique({
      where: {
        idCompra: Number(id),
      },
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
    });

    if (!compra) {
      throw new AppError("Venda não encontrada.", {
        status: 404,
        code: "VENDA_NAO_ENCONTRADA",
      });
    }

    const venda = mapearVenda(compra);

    return {
      ...venda,
      itens: compra.itensCompra.map((item) => ({
        nome: item.produto?.nomeProduto,
        quantidade: item.quantidadeItem,
        preco: Number(item.precoUnitario),
      })),
    };
  }
}
