// Tela de vendas APM: monta a compra e envia a finalização ao apmService.
import ResumoCompra from "../layout/ResumoCompra";
import AtendimentoActions from "../common/AtendimentoActions";
import Alert from "../ui/Alert";
import ArmarioVenda from "./Vendas/ArmarioVenda";
import ContribuicaoVoluntaria from "./Vendas/ContribuicaoVoluntaria";
import FormasPagamento from "./Vendas/FormasPagamento";
import InfoAluno from "./Vendas/InfoAluno";
import ListaUniformes from "./Vendas/ListaUniformes";
import SelectUniformes from "./Vendas/SelectUniformes";
import { useAtendimento } from "../../hooks/useAtendimento";
import { useVendaApm } from "../../hooks/useVendaApm";
import {
  finalizarSemVenda,
  registrarVenda,
} from "../../services/apmService";

const ApmVendas = () => {
  const atendimento = useAtendimento();

  // Reinicia o formulário sempre que a senha em atendimento mudar.
  return (
    <ApmVendasAtual
      key={atendimento.senhaAtual?.id ?? "sem-senha"}
      {...atendimento}
    />
  );
};

const ApmVendasAtual = ({ dados, atendendo }) => {
  const venda = useVendaApm();
  const telaBloqueada = !atendendo || venda.carregandoCatalogo;
  const possuiVenda = venda.total > 0;

  const finalizar = (atendimentoId) =>
    registrarVenda(atendimentoId, venda.gerarPayload());

  const pularVenda = async (atendimentoId) => {
    const confirmou = window.confirm(
      "Deseja finalizar este atendimento sem registrar uma venda?",
    );
    if (!confirmou) return false;

    await finalizarSemVenda(atendimentoId);
    return true;
  };

  return (
    <div className="w-full max-w-360 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_19rem] gap-5 items-start">
      <div className="space-y-5 min-w-0">
        {venda.carregandoCatalogo && (
          <Alert type="info" message="Carregando catálogo da APM..." />
        )}
        {venda.erroCatalogo && (
          <Alert type="error" message={venda.erroCatalogo} />
        )}
        <InfoAluno aluno={dados} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ArmarioVenda
            armario={venda.armario}
            permitido={venda.armarioDisponivel}
            onChange={venda.setArmarioIncluido}
            disabled={telaBloqueada}
          />
          <ContribuicaoVoluntaria
            valorContribuicao={venda.valorContribuicao}
            onChange={venda.setValorContribuicao}
            disabled={telaBloqueada}
          />
        </div>
        <SelectUniformes
          uniformes={venda.produtos.uniformes}
          onAdicionar={venda.adicionarUniforme}
          disabled={telaBloqueada}
        />
        <ListaUniformes
          itens={venda.itens}
          onAlterarComprada={venda.alterarQuantidadeComprada}
          onAlterarRetirada={venda.alterarQuantidadeRetirada}
          onExcluir={venda.excluirUniforme}
          disabled={telaBloqueada}
        />
        {possuiVenda && (
          <FormasPagamento
            formas={venda.formasPagamento}
            pagamentosSelecionados={venda.pagamentosSelecionados}
            valores={venda.valoresPagamento}
            diferencaPagamento={venda.diferencaPagamento}
            onAlternarForma={venda.alternarFormaPagamento}
            onAlterarValor={(forma, valorTotal) =>
              venda.setValoresPagamento((anteriores) => ({
                ...anteriores,
                [forma]: valorTotal,
              }))
            }
            disabled={telaBloqueada}
          />
        )}
        <AtendimentoActions
          podeFinalizar={possuiVenda ? venda.pagamentoValido : true}
          textoFinalizar={possuiVenda ? "Finalizar compra" : "Pular venda"}
          onFinalizar={possuiVenda ? finalizar : pularVenda}
        />
      </div>
      <ResumoCompra
        aluno={dados}
        itens={venda.itens}
        armario={venda.armario}
        valorContribuicao={venda.valorContribuicao}
        total={venda.total}
      />
    </div>
  );
};

export default ApmVendas;
