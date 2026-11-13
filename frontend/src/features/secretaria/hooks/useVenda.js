import * as React from "react";
import { listarProdutos } from "../../admin/services/produtoService";

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

  const [items, setItems] = React.useState([]);
  const [pagamentosSelecionados, setPagamentosSelecionados] = React.useState([]);
  const [valores, setValores] = React.useState(VALORES_INICIAIS);

  const carregarUniformes = React.useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = await listarProdutos({ tipo: "uniforme", status: true });
      setUniformes(res?.produtos || []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    carregarUniformes();
  }, [carregarUniformes]);

  const adicionarUniforme = (idUniforme) => {
    const id = Number(idUniforme);
    const produto = uniformes.find((u) => u.id === id);
    if (!produto || produto.quantidade <= 0) return;

    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);

      if (index >= 0) {
        return prev.map((item, idx) => {
          if (idx !== index) return item;
          const novaQuantidade = Math.min(item.quantidade + 1, item.estoque);
          return { ...item, quantidade: novaQuantidade };
        });
      }

      return [
        ...prev,
        {
          id: produto.id,
          tamanho: produto.nome,
          preco: Number(produto.preco),
          estoque: produto.quantidade,
          quantidade: 1,
        },
      ];
    });
  };

  const alterarQuantidade = (idUniforme, mudanca) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== idUniforme) return item;
        const novaQuantidade = Math.max(
          1,
          Math.min(item.estoque, item.quantidade + mudanca),
        );
        return { ...item, quantidade: novaQuantidade };
      }),
    );
  };

  const excluirUniforme = (idUniforme) => {
    setItems((prev) => prev.filter((item) => item.id !== idUniforme));
  };

  const alterarFormaPagamento = (forma) => {
    setPagamentosSelecionados((prev) => {
      const existe = prev.includes(forma);
      if (existe) {
        setValores((val) => ({ ...val, [forma]: 0 }));
        return prev.filter((f) => f !== forma);
      }
      return [...prev, forma];
    });
  };

  const alterarValorPagamento = (forma, valor) => {
    setValores((prev) => ({
      ...prev,
      [forma]: Math.max(0, Number(valor) || 0),
    }));
  };

  const totalCompra =
    Math.round(
      items.reduce(
        (acc, item) => acc + item.preco * item.quantidade,
        0,
      ) * 100,
    ) / 100;

  const totalPago =
    Math.round(
      pagamentosSelecionados.reduce(
        (acc, forma) => acc + (valores[forma] || 0),
        0,
      ) * 100,
    ) / 100;

  const diferencaPagamento = Math.round((totalCompra - totalPago) * 100) / 100;
  const podeFinalizar = totalCompra > 0 && diferencaPagamento === 0 && items.length > 0;

  const limparVenda = () => {
    setItems([]);
    setPagamentosSelecionados([]);
    setValores(VALORES_INICIAIS);
  };

  const payload = () => ({
    itens: items.map((item) => ({
      produtoId: item.id,
      quantidade: item.quantidade,
      precoUnitario: item.preco,
    })),
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
    items,
    adicionarUniforme,
    alterarQuantidade,
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
    payload,
    recarregarUniformes: carregarUniformes,
  };
};

export default useVenda;
