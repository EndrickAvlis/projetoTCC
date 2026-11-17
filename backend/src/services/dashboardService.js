import prisma from "../config/prisma.js";

const FUSO_HORARIO = "America/Sao_Paulo";

const obterDiaLocal = (data = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_HORARIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(data);

const inicioDiaLocal = (dia) => new Date(`${dia}T00:00:00-03:00`);
const fimDiaLocal = (dia) => new Date(`${dia}T23:59:59.999-03:00`);

export const intervaloPeriodo = ({ periodo, dataInicio, dataFim }) => {
  if (periodo === "TODO") return undefined;
  if (periodo === "PERSONALIZADO") {
    return { gte: inicioDiaLocal(dataInicio), lte: fimDiaLocal(dataFim) };
  }

  const hoje = obterDiaLocal();
  let primeiroDia = hoje;

  if (periodo === "SEMANA") {
    const data = new Date(`${hoje}T12:00:00Z`);
    const diaSemana = data.getUTCDay();
    data.setUTCDate(data.getUTCDate() - ((diaSemana + 6) % 7));
    primeiroDia = data.toISOString().slice(0, 10);
  } else if (periodo === "MES") {
    primeiroDia = `${hoje.slice(0, 7)}-01`;
  }

  return { gte: inicioDiaLocal(primeiroDia), lte: fimDiaLocal(hoje) };
};

export const arredondarMoeda = (valor) => Math.round(Number(valor) * 100) / 100;

const numero = (valor) => Number(valor ?? 0);

const ordenarUniformes = (a, b) =>
  b.quantidade - a.quantidade ||
  b.total - a.total ||
  a.nome.localeCompare(b.nome, "pt-BR");

const ordenarCursos = (a, b) =>
  b.total - a.total ||
  b.quantidade - a.quantidade ||
  a.nome.localeCompare(b.nome, "pt-BR");

export default class DashboardService {
  async obterDashboard(filtros) {
    const intervalo = intervaloPeriodo(filtros);
    const compras = await prisma.compra.findMany({
      where: intervalo ? { dataHoraCompra: intervalo } : {},
      select: {
        valorCompra: true,
        itensCompra: {
          select: {
            codProduto: true,
            quantidadeItem: true,
            precoUnitario: true,
            produto: {
              select: {
                nomeProduto: true,
                tipoProduto: true,
              },
            },
          },
        },
        contribuicoes: {
          select: {
            valorContribuicao: true,
          },
        },
        aluno: {
          select: {
            cursosAluno: {
              orderBy: [{ statusMatricula: "desc" }, { codCurso: "asc" }],
              take: 1,
              select: {
                codCurso: true,
                curso: {
                  select: {
                    nomeCurso: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const categorias = {
      uniformes: { valor: 0, quantidade: 0 },
      armarios: { valor: 0, quantidade: 0 },
      contribuicao: { valor: 0, quantidade: 0 },
    };
    const produtos = new Map();
    const cursos = new Map();
    let arrecadado = 0;

    for (const compra of compras) {
      const valorCompra = numero(compra.valorCompra);
      arrecadado = arredondarMoeda(arrecadado + valorCompra);

      for (const item of compra.itensCompra) {
        const quantidade = item.quantidadeItem;
        const valor = arredondarMoeda(numero(item.precoUnitario) * quantidade);
        const tipo = item.produto.tipoProduto;

        if (tipo === "uniforme" || tipo === "armario") {
          const categoria =
            tipo === "uniforme" ? categorias.uniformes : categorias.armarios;
          categoria.quantidade += quantidade;
          categoria.valor = arredondarMoeda(categoria.valor + valor);
        }

        if (tipo === "uniforme") {
          const id = item.codProduto;
          const produto = produtos.get(id) ?? {
            id,
            nome: item.produto.nomeProduto,
            quantidade: 0,
            total: 0,
          };
          produto.quantidade += quantidade;
          produto.total = arredondarMoeda(produto.total + valor);
          produtos.set(id, produto);
        }
      }

      for (const contribuicao of compra.contribuicoes) {
        categorias.contribuicao.quantidade += 1;
        categorias.contribuicao.valor = arredondarMoeda(
          categorias.contribuicao.valor +
            numero(contribuicao.valorContribuicao),
        );
      }

      const matricula = compra.aluno?.cursosAluno?.[0];
      const cursoId = matricula?.codCurso ?? "sem-curso";
      const cursoNome =
        matricula?.curso?.nomeCurso ?? "Sem curso vinculado";
      const curso = cursos.get(cursoId) ?? {
        id: cursoId,
        nome: cursoNome,
        quantidade: 0,
        total: 0,
      };
      curso.quantidade += 1;
      curso.total = arredondarMoeda(curso.total + valorCompra);
      cursos.set(cursoId, curso);
    }

    return {
      totais: { arrecadado, vendas: compras.length },
      categorias,
      produtos: [...produtos.values()].sort(ordenarUniformes),
      cursos: [...cursos.values()].sort(ordenarCursos),
    };
  }
}
