import * as React from "react";
import * as ApmService from "../services/apmService";

const FORMAS_PAGAMENTO = ["pix", "dinheiro", "debito", "credito"];

const VALORES_INICIAIS = {
  pix: 0,
  dinheiro: 0,
  debito: 0,
  credito: 0,
};

export const useVenda = () => {
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState(null);
  const [uniformes, setUniformes] = React.useState([]);
  const [configArmario, setConfigArmario] = React.useState(null);

  const [items, setItems] = React.useState([]);
  const [armarioIncluido, setArmarioIncluido] = React.useState(false);
  const [contribuicao, setContribuicao] = React.useState(0);
  const [pagamentosSelecionados, setPagamentosSelecionados] = React.useState(
    [],
  );
  const [valores, setValores] = React.useState(VALORES_INICIAIS);

  const listarProdutos = React.useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const dados = await ApmService.listarProdutos();
      setUniformes(dados.uniformes || []);
      setConfigArmario(dados.armario || null);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    listarProdutos();
  }, [listarProdutos]);

  const armarioDisponivel = Boolean(
    configArmario &&
    configArmario.status === "disponivel" &&
    configArmario.quantidade > 0,
  );

  const armario = {
    preco: configArmario ? Number(configArmario.preco) : 0,
    estoque: configArmario ? configArmario.quantidade : 0,
    disponivel: armarioDisponivel,
    incluido: armarioDisponivel && armarioIncluido,
  };

  const adicionarUniforme = (idUniforme) => {
    const id = Number(idUniforme);
    const produto = uniformes.find((uniform) => uniform.id === id);
    if (!produto) return;

    setItems((prevs) => {
      const index = prevs.findIndex((item) => item.id === id);

      if (index >= 0) {
        return prevs.map((item, idx) => {
          if (idx !== index) return item;
          const novaComprada = item.quantidadeComprada + 1;
          const novaRetirada =
            item.quantidadeRetirada < item.estoque
              ? item.quantidadeRetirada + 1
              : item.quantidadeRetirada;
          return {
            ...item,
            quantidadeComprada: novaComprada,
            quantidadeRetirada: novaRetirada,
          };
        });
      }

      const estoque = produto.quantidade || 0;
      return [
        ...prevs,
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

  const alterarQuantidadeComprada = (idUniforme, mudanca) => {
    setItems((prevs) =>
      prevs.map((item) => {
        if (item.id !== idUniforme) return item;
        const novaComprada = Math.max(1, item.quantidadeComprada + mudanca);
        const novaRetirada = Math.min(item.quantidadeRetirada, novaComprada);
        return {
          ...item,
          quantidadeComprada: novaComprada,
          quantidadeRetirada: novaRetirada,
        };
      }),
    );
  };

  const alterarQuantidadeRetirada = (idUniforme, mudanca) => {
    setItems((prevs) =>
      prevs.map((item) => {
        if (item.id !== idUniforme) return item;
        const limiteMaximo = Math.min(item.quantidadeComprada, item.estoque);
        const novaRetirada = Math.max(
          0,
          Math.min(limiteMaximo, item.quantidadeRetirada + mudanca),
        );
        return { ...item, quantidadeRetirada: novaRetirada };
      }),
    );
  };

  const excluirUniforme = (idUniforme) => {
    setItems((prevs) => prevs.filter((item) => item.id !== idUniforme));
  };

  const alterarFormaPagamento = (forma) => {
    setPagamentosSelecionados((prevs) => {
      const existe = prevs.includes(forma);
      if (existe) {
        setValores((value) => ({ ...value, [forma]: 0 }));
        return prevs.filter((formaPag) => formaPag !== forma);
      }
      return [...prevs, forma];
    });
  };

  const alterarValorPagamento = (forma, valor) => {
    setValores((prevs) => ({
      ...prevs,
      [forma]: Math.max(0, Number(valor) || 0),
    }));
  };

  const totalUniformes = items.reduce(
    (cont, item) => cont + item.preco * item.quantidadeComprada,
    0,
  );

  const totalCompra =
    Math.round(
      (totalUniformes +
        (armario.incluido ? armario.preco : 0) +
        (Number(contribuicao) || 0)) *
        100,
    ) / 100;

  const totalPago =
    Math.round(
      pagamentosSelecionados.reduce(
        (cont, forma) => cont + (valores[forma] || 0),
        0,
      ) * 100,
    ) / 100;

  const diferencaPagamento = Math.round((totalCompra - totalPago) * 100) / 100;

  const podeFinalizar = totalCompra === 0 || diferencaPagamento === 0;

  const limparVenda = () => {
    setItems([]);
    setArmarioIncluido(false);
    setContribuicao(0);
    setPagamentosSelecionados([]);
    setValores(VALORES_INICIAIS);
  };

  const gerarPayload = () => ({
    itens: items.map((item) => ({
      produtoId: item.id,
      quantidade: item.quantidadeComprada,
      quantidadeRetirada: item.quantidadeRetirada,
      precoUnitario: item.preco,
    })),
    armario: armario.incluido,
    valorContribuicao: Number(contribuicao) || 0,
    pagamentos: pagamentosSelecionados.map((forma) => ({
      tipo: forma,
      valor: valores[forma] || 0,
    })),
    valorTotal: totalCompra,
  });

  return {
    carregando,
    erro,
    uniformes,
    armario,
    armarioDisponivel,
    setArmarioIncluido,
    contribuicao,
    setContribuicao,
    items,
    adicionarUniforme,
    alterarQuantidadeComprada,
    alterarQuantidadeRetirada,
    excluirUniforme,
    formasPagamento: FORMAS_PAGAMENTO,
    pagamentosSelecionados,
    valores,
    alterarFormaPagamento,
    alterarValorPagamento,
    totalCompra,
    totalPago,
    diferencaPagamento,
    podeFinalizar,
    limparVenda,
    gerarPayload,
    listarProdutos,
  };
};

export default useVenda;
