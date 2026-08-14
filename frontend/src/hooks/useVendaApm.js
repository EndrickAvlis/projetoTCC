// Hook da venda APM: controla o formulário e carrega o catálogo pela API.
import * as React from "react";
import * as ApmService from "../services/apmService";

const FORMAS_PAGAMENTO = ["pix", "dinheiro", "debito", "credito"];
const PRODUTOS_VAZIOS = {
  uniformes: [],
  armario: { permitido: false, preco: 0, estoque: 0 },
};
const arredondarValor = (valor) => Math.round(valor * 100) / 100;

export const useVendaApm = () => {
  const [produtos, setProdutos] = React.useState(PRODUTOS_VAZIOS);
  const [carregandoCatalogo, setCarregandoCatalogo] = React.useState(true);
  const [erroCatalogo, setErroCatalogo] = React.useState(null);
  const [itens, setItens] = React.useState([]);
  const [valorContribuicao, setValorContribuicao] = React.useState(0);
  const [armarioIncluido, setArmarioIncluido] = React.useState(false);
  const [pagamentosSelecionados, setPagamentosSelecionados] = React.useState([]);
  const [valoresPagamento, setValoresPagamento] = React.useState({});

  React.useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      try {
        const catalogo = await ApmService.carregarCatalogoVenda();
        if (ativo) setProdutos(catalogo);
      } catch (erro) {
        if (ativo) setErroCatalogo(erro.message);
      } finally {
        if (ativo) setCarregandoCatalogo(false);
      }
    };

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const armarioDisponivel =
    produtos.armario.permitido && produtos.armario.estoque > 0;
  const armario = {
    ...produtos.armario,
    incluido: armarioDisponivel && armarioIncluido,
  };
  const totalUniformes = React.useMemo(
    () =>
      arredondarValor(
        itens.reduce(
          (soma, item) => soma + item.preco * item.quantidadeComprada,
          0,
        ),
      ),
    [itens],
  );
  const total = arredondarValor(
    totalUniformes +
      valorContribuicao +
      (armario.incluido ? armario.preco : 0),
  );
  const totalPago = arredondarValor(
    pagamentosSelecionados.reduce(
      (soma, forma) => soma + (valoresPagamento[forma] || 0),
      0,
    ),
  );
  const diferencaPagamento = arredondarValor(total - totalPago);
  const pagamentoValido = total > 0 && diferencaPagamento === 0;

  const adicionarUniforme = (uniformeId) => {
    const uniforme = produtos.uniformes.find((item) => item.id === uniformeId);
    if (!uniforme) return;

    setItens((anteriores) => {
      const existente = anteriores.find((item) => item.id === uniforme.id);
      if (!existente) {
        return [
          {
            ...uniforme,
            quantidadeComprada: 1,
            quantidadeRetirada: Math.min(1, uniforme.estoque),
          },
          ...anteriores,
        ];
      }

      return anteriores.map((item) => {
        if (item.id !== uniforme.id) return item;
        const quantidadeComprada = item.quantidadeComprada + 1;
        return {
          ...item,
          quantidadeComprada,
          quantidadeRetirada: Math.min(quantidadeComprada, item.estoque),
        };
      });
    });
  };

  const alterarQuantidadeComprada = (id, variacao) =>
    setItens((anteriores) =>
      anteriores.map((item) => {
        if (item.id !== id) return item;
        const quantidadeComprada = Math.max(
          1,
          item.quantidadeComprada + variacao,
        );
        return {
          ...item,
          quantidadeComprada,
          quantidadeRetirada: Math.min(
            item.quantidadeRetirada,
            quantidadeComprada,
          ),
        };
      }),
    );

  const alterarQuantidadeRetirada = (id, variacao) =>
    setItens((anteriores) =>
      anteriores.map((item) => {
        if (item.id !== id) return item;
        const limite = Math.min(item.quantidadeComprada, item.estoque);
        return {
          ...item,
          quantidadeRetirada: Math.max(
            0,
            Math.min(limite, item.quantidadeRetirada + variacao),
          ),
        };
      }),
    );

  const excluirUniforme = (id) =>
    setItens((anteriores) => anteriores.filter((item) => item.id !== id));

  const alternarFormaPagamento = (forma) => {
    const marcada = pagamentosSelecionados.includes(forma);
    if (marcada) {
      setValoresPagamento((valores) => ({ ...valores, [forma]: 0 }));
    }
    setPagamentosSelecionados((anteriores) =>
      marcada
        ? anteriores.filter((item) => item !== forma)
        : [...anteriores, forma],
    );
  };

  const gerarPayload = () => ({
    itens: itens.map(({ id, quantidadeComprada, quantidadeRetirada }) => ({
      uniformeId: id,
      quantidadeComprada,
      quantidadeRetirada,
    })),
    contribuicaoCentavos: ApmService.reaisParaCentavos(valorContribuicao),
    armario: armario.incluido
      ? { quantidadeComprada: 1, quantidadeRetirada: 1 }
      : null,
    pagamentos: pagamentosSelecionados.map((forma) => ({
      forma,
      valorCentavos: ApmService.reaisParaCentavos(valoresPagamento[forma] || 0),
    })),
  });

  return {
    produtos,
    carregandoCatalogo,
    erroCatalogo,
    itens,
    valorContribuicao,
    setValorContribuicao,
    armario,
    armarioDisponivel,
    setArmarioIncluido,
    pagamentosSelecionados,
    valoresPagamento,
    setValoresPagamento,
    total,
    totalPago,
    diferencaPagamento,
    pagamentoValido,
    adicionarUniforme,
    alterarQuantidadeComprada,
    alterarQuantidadeRetirada,
    excluirUniforme,
    alternarFormaPagamento,
    gerarPayload,
    formasPagamento: FORMAS_PAGAMENTO,
  };
};
