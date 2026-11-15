import BaseService from "./baseService.js";
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import { intervaloPeriodo } from "./dashboardService.js";

const arredondarMoeda = (valor) => Math.round(valor * 100) / 100;

const compraDetalhesInclude = {
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
};

const ordenacaoPadrao = [
  { dataHoraCompra: "desc" },
  { idCompra: "desc" },
];

const CABECALHO_CSV =
  "Código;Data e Hora;Aluno;Curso;Período;Atendente;Pagamento;Qtd Itens;Contribuição;Total";

const formatarDataCsv = (data) =>
  new Date(data).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

const formatarCampoCsv = (valor) => {
  const texto = String(valor ?? "")
    .replace(/^[\s]*([=+@-])/, "'$1")
    .replace(/"/g, '""');

  return `"${texto}"`;
};

const dataArquivoLocal = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

const montarFiltrosWhere = ({
  periodo,
  dataInicio,
  dataFim,
  cursoId,
  formaPagamento,
  atendenteId,
}) => {
  const intervalo = intervaloPeriodo({ periodo, dataInicio, dataFim });
  const where = intervalo ? { dataHoraCompra: intervalo } : {};

  if (cursoId) {
    where.aluno = {
      cursosAluno: {
        some: { codCurso: cursoId },
      },
    };
  }

  if (formaPagamento) {
    where.pagamentos = {
      some: { tipoPagamento: formaPagamento },
    };
  }

  if (atendenteId) {
    where.codVoluntario = atendenteId;
  }

  return where;
};

const mapearVenda = (compra) => {
  const matricula = compra.aluno?.cursosAluno?.[0];

  const quantidadeItens = compra.itensCompra.reduce(
    (total, item) => total + item.quantidadeItem,
    0,
  );

  const contribuicao = arredondarMoeda(
    compra.contribuicoes.reduce(
      (total, item) => total + Number(item.valorContribuicao),
      0,
    ),
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

const calcularResumoReceita = (compras) => {
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

  for (const compra of compras) {
    totalArrecadado = arredondarMoeda(
      totalArrecadado + Number(compra.valorCompra),
    );

    for (const item of compra.itensCompra) {
      const tipo = item.produto?.tipoProduto;

      if (tipo === "uniforme" || tipo === "armario") {
        const categoria =
          tipo === "uniforme" ? porCategoria.uniformes : porCategoria.armarios;

        categoria.valor = arredondarMoeda(
          categoria.valor + Number(item.precoUnitario) * item.quantidadeItem,
        );
        categoria.quantidade += item.quantidadeItem;
      }
    }

    for (const contribuicao of compra.contribuicoes) {
      porCategoria.contribuicao.valor = arredondarMoeda(
        porCategoria.contribuicao.valor + Number(contribuicao.valorContribuicao),
      );
      porCategoria.contribuicao.quantidade++;
    }

    for (const pagamento of compra.pagamentos) {
      const tipo = pagamento.tipoPagamento;

      if (tipo in porPagamento) {
        porPagamento[tipo] = arredondarMoeda(
          porPagamento[tipo] + Number(pagamento.valorPagamento),
        );
      }
    }
  }

  const totalVendas = compras.length;

  return {
    totais: {
      totalArrecadado,
      totalVendas,
      ticketMedio: totalVendas
        ? arredondarMoeda(totalArrecadado / totalVendas)
        : 0,
    },
    porCategoria,
    porPagamento,
  };
};

export default class RelatorioService extends BaseService {
  constructor() {
    super(prisma.compra, "idCompra");
  }

  async exportarVendasCsv(filtros = {}) {
    const compras = await prisma.compra.findMany({
      where: montarFiltrosWhere(filtros),
      include: compraDetalhesInclude,
      orderBy: ordenacaoPadrao,
    });

    const linhas = compras.map((compra) => {
      const venda = mapearVenda(compra);
      return [
        venda.codigoRetirada,
        formatarDataCsv(venda.dataHora),
        venda.aluno,
        venda.curso,
        venda.periodo,
        venda.atendente,
        venda.formaPagamento,
        venda.quantidadeItens,
        venda.contribuicao.toFixed(2).replace(".", ","),
        venda.precoTotal.toFixed(2).replace(".", ","),
      ]
        .map(formatarCampoCsv)
        .join(";");
    });

    return {
      csv: `\uFEFF${CABECALHO_CSV}\n${linhas.join("\n")}`,
      nomeArquivo: `extrato-vendas-${dataArquivoLocal()}.csv`,
    };
  }

  async obterDadosRelatorio({ pagina = 1, limite = 10, ...filtros } = {}) {
    const where = montarFiltrosWhere(filtros);

    const [compras, todasCompras] = await Promise.all([
      prisma.compra.findMany({
        where,
        include: {
          aluno: true,
          itensCompra: true,
        },
        orderBy: ordenacaoPadrao,
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

    const totalVendas = todasCompras.length;

    return {
      resumoReceita: calcularResumoReceita(todasCompras),
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
    const compra = await super.buscarPorId(id, {
      include: compraDetalhesInclude,
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
      pagamentos: compra.pagamentos.map((pag) => ({
        tipo: pag.tipoPagamento,
        valor: Number(pag.valorPagamento)
      }))
    };
  }
}
