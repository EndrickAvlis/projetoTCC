import prisma from "../config/prisma.js";

const dataLocal = (data) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
}).format(data);

const inicioDia = (dia) => new Date(`${dia}T03:00:00.000Z`);
const fimDia = (dia) => new Date(new Date(inicioDia(dia)).getTime() + 86400000 - 1);

const intervaloPeriodo = ({ periodo, dataInicio, dataFim }) => {
  if (periodo === "todo") return undefined;
  if (periodo === "personalizado") return { gte: inicioDia(dataInicio), lte: fimDia(dataFim) };

  const hoje = dataLocal(new Date());
  let primeiroDia = hoje;
  if (periodo === "semana") {
    const data = inicioDia(hoje);
    const diaSemana = data.getUTCDay();
    data.setUTCDate(data.getUTCDate() - ((diaSemana + 6) % 7));
    primeiroDia = data.toISOString().slice(0, 10);
  } else if (periodo === "mes") {
    primeiroDia = `${hoje.slice(0, 7)}-01`;
  }
  return { gte: inicioDia(primeiroDia), lte: fimDia(hoje) };
};

const numero = (valor) => Number(valor ?? 0);

export default class DashboardService {
  async obterDashboard(filtros) {
    const intervalo = intervaloPeriodo(filtros);
    const compras = await prisma.compra.findMany({
      where: intervalo ? { dataHoraCompra: intervalo } : {},
      include: {
        itensCompra: { include: { produto: true } },
        contribuicoes: true,
        aluno: { include: { cursosAluno: { include: { curso: true }, take: 1 } } },
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
      arrecadado += numero(compra.valorCompra);
      let quantidadeCompra = 0;
      for (const item of compra.itensCompra) {
        const quantidade = item.quantidadeItem;
        const valor = numero(item.precoUnitario) * quantidade;
        quantidadeCompra += quantidade;
        const tipo = item.produto.tipoProduto;
        if (tipo === "uniforme" || tipo === "armario") {
          const categoria = tipo === "uniforme" ? categorias.uniformes : categorias.armarios;
          categoria.quantidade += quantidade;
          categoria.valor += valor;
        }
        if (tipo === "uniforme") {
          const id = item.codProduto;
          const produto = produtos.get(id) ?? { id, nome: item.produto.nomeProduto, quantidade: 0, total: 0 };
          produto.quantidade += quantidade;
          produto.total += valor;
          produtos.set(id, produto);
        }
      }
      for (const contribuicao of compra.contribuicoes) {
        categorias.contribuicao.quantidade += 1;
        categorias.contribuicao.valor += numero(contribuicao.valorContribuicao);
      }
      const matricula = compra.aluno?.cursosAluno?.[0];
      if (matricula) {
        const id = matricula.codCurso;
        const curso = cursos.get(id) ?? { id, nome: matricula.curso.nomeCurso, quantidade: 0, total: 0 };
        curso.quantidade += quantidadeCompra;
        curso.total += numero(compra.valorCompra);
        cursos.set(id, curso);
      }
    }

    const ordenar = (a, b) => b.quantidade - a.quantidade;
    return {
      totais: { arrecadado, vendas: compras.length },
      categorias,
      produtos: [...produtos.values()].sort(ordenar),
      cursos: [...cursos.values()].sort(ordenar),
    };
  }
}