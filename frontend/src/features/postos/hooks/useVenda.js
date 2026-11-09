import * as React from "react";
import * as ApmService from "../services/apmService";

const FORMAS_PAGAMENTO = ["pix", "dinheiro", "debito", "credito"];
const PAGAMENTOS_ZERADOS = { pix: 0, dinheiro: 0, debito: 0, credito: 0 };

export const useVenda = () => {
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState(null);
  const [uniformesDisponiveis, setUniformesDisponiveis] = React.useState([]);
  const [configArmario, setConfigArmario] = React.useState(null);

  const [uniformesSelecionados, setUniformesSelecionados] = React.useState([]);
  const [armarioIncluido, setArmarioIncluido] = React.useState(false);
  const [contribuicao, setContribuicao] = React.useState(0);
  const [pagamentosSelecionados, setPagamentosSelecionados] = React.useState([]);
  const [valoresPagamento, setValoresPagamento] = React.useState(PAGAMENTOS_ZERADOS);

  const carregarProdutos = React.useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) setCarregando(true);
    setErro(null);

    try {
      const dados = await ApmService.listarProdutos();
      setUniformesDisponiveis(dados.uniformes || []);
      setConfigArmario(dados.armario || null);
    } catch (err) {
      setUniformesDisponiveis([]);
      setConfigArmario(null);
      setErro(err.message);
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const adicionarUniforme = (idUniforme) => {
    const id = Number(idUniforme);
    const produto = uniformesDisponiveis.find((u) => u.id === id);
    if (!produto) return;

    setUniformesSelecionados((atuais) => {
      const jaExiste = atuais.find((item) => item.id === id);

      if (jaExiste) {
        return atuais.map((item) => {
          if (item.id !== id) return item;
          const novaComprada = item.quantidadeComprada + 1;
          const novaRetirada = item.quantidadeRetirada < item.estoque ? item.quantidadeRetirada + 1 : item.quantidadeRetirada;
          return { ...item, quantidadeComprada: novaComprada, quantidadeRetirada: novaRetirada };
        });
      }

      const estoque = produto.quantidade || 0;
      return [
        ...atuais,
        {
          id: produto.id,
          tamanho: produto.nome,
          preco: Number(produto.preco),
          estoque,
          quantidadeComprada: 1,
          quantidadeRetirada: estoque > 0 ? 1 : 0,
        },
      ];
    });
  };

  const alterarComprada = (id, delta) => {
    setUniformesSelecionados((atuais) =>
      atuais.map((item) => {
        if (item.id !== id) return item;
        const novaComprada = Math.max(1, item.quantidadeComprada + delta);
        const novaRetirada = Math.min(item.quantidadeRetirada, novaComprada);
        return { ...item, quantidadeComprada: novaComprada, quantidadeRetirada: novaRetirada };
      })
    );
  };

  const alterarRetirada = (id, delta) => {
    setUniformesSelecionados((atuais) =>
      atuais.map((item) => {
        if (item.id !== id) return item;
        const limite = Math.min(item.quantidadeComprada, item.estoque);
        const novaRetirada = Math.max(0, Math.min(limite, item.quantidadeRetirada + delta));
        return { ...item, quantidadeRetirada: novaRetirada };
      })
    );
  };

  const removerUniforme = (id) => {
    setUniformesSelecionados((atuais) => atuais.filter((item) => item.id !== id));
  };

  const alternarFormaPagamento = (forma) => {
    setPagamentosSelecionados((atuais) => {
      const existe = atuais.includes(forma);
      if (existe) {
        setValoresPagamento((v) => ({ ...v, [forma]: 0 }));
        return atuais.filter((f) => f !== forma);
      }
      return [...atuais, forma];
    });
  };

  const alterarValorPagamento = (forma, valor) => {
    setValoresPagamento((v) => ({
      ...v,
      [forma]: Math.max(0, Number(valor) || 0),
    }));
  };

  const totalUniformes = uniformesSelecionados.reduce(
    (acc, item) => acc + item.preco * item.quantidadeComprada,
    0
  );

  const armarioDisponivel = Boolean(configArmario && configArmario.status && configArmario.quantidade > 0);
  const precoArmario = configArmario ? Number(configArmario.preco) : 0;
  const valorArmario = armarioDisponivel && armarioIncluido ? precoArmario : 0;
  const valorContribuicao = Math.max(0, Number(contribuicao) || 0);

  const totalCompra = Math.round((totalUniformes + valorArmario + valorContribuicao) * 100) / 100;

  const totalPago = Math.round(
    pagamentosSelecionados.reduce((acc, forma) => acc + (valoresPagamento[forma] || 0), 0) * 100
  ) / 100;

  const diferencaPagamento = Math.round((totalCompra - totalPago) * 100) / 100;
  const podeFinalizar = totalCompra === 0 || diferencaPagamento === 0;

  const limparVenda = () => {
    setUniformesSelecionados([]);
    setArmarioIncluido(false);
    setContribuicao(0);
    setPagamentosSelecionados([]);
    setValoresPagamento(PAGAMENTOS_ZERADOS);
  };

  const gerarPayload = () => {
    const itens = uniformesSelecionados.map((item) => ({
      produtoId: item.id,
      quantidade: item.quantidadeComprada,
      quantidadeRetirada: item.quantidadeRetirada,
      precoUnitario: item.preco,
    }));

    if (armarioDisponivel && armarioIncluido && configArmario?.id) {
      itens.push({
        produtoId: configArmario.id,
        quantidade: 1,
        quantidadeRetirada: 1,
        precoUnitario: precoArmario,
      });
    }

    return {
      itens,
      valorContribuicao,
      pagamentos: pagamentosSelecionados
        .filter((forma) => (valoresPagamento[forma] || 0) > 0)
        .map((forma) => ({
          tipo: forma,
          valor: valoresPagamento[forma],
        })),
      valorTotal: totalCompra,
    };
  };

  return {
    catalogo: {
      carregando,
      erro,
      carregarProdutos,
    },
    uniformes: {
      disponiveis: uniformesDisponiveis,
      selecionados: uniformesSelecionados,
      total: totalUniformes,
      adicionar: adicionarUniforme,
      alterarComprada,
      alterarRetirada,
      remover: removerUniforme,
    },
    armario: {
      id: configArmario?.id ?? null,
      preco: precoArmario,
      estoque: configArmario?.quantidade ?? 0,
      disponivel: armarioDisponivel,
      incluido: armarioDisponivel && armarioIncluido,
      setIncluido: setArmarioIncluido,
    },
    contribuicao: {
      valor: contribuicao,
      setValor: setContribuicao,
    },
    pagamento: {
      formas: FORMAS_PAGAMENTO,
      selecionados: pagamentosSelecionados,
      valores: valoresPagamento,
      total: totalCompra,
      totalPago,
      diferenca: diferencaPagamento,
      podeFinalizar,
      alternarForma: alternarFormaPagamento,
      alterarValor: alterarValorPagamento,
    },
    limparVenda,
    gerarPayload,
  };
};

export default useVenda;
