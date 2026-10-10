import InfoAluno from "./InfoAluno";
import ArmarioVenda from "./ArmarioVenda";
import ContribuicaoVoluntaria from "./ContribuicaoVoluntaria";
import SelectUniformes from "./SelectUniformes";
import ListaUniformes from "./ListaUniformes";
import FormasPagamento from "./FormasPagamento";
import ResumoCompra from "./ResumoCompra";
import AtendimentoActions from "../../layout/AtendimentoActions";
import Alert from "../../../../components/ui/Alert";
import { useAtendimento } from "../../context/atendimentoContext";
import { useVenda } from "../../hooks/useVenda";
import * as ApmService from "../../services/apmService";

const ApmMain = () => {
  const { senhaAtual, dadosAluno, finalizar } = useAtendimento();
  const venda = useVenda();

  const desabilitado = !senhaAtual || venda.carregando;

  const handleFinalizar = async () => {
    if (venda.totalCompra > 0) {
      await ApmService.registrarVenda(senhaAtual.id, venda.gerarPayload());
    }
    await finalizar();
    venda.limparVenda();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Barra de Ações Fixa no Topo */}
      <AtendimentoActions
        podeFinalizar={venda.podeFinalizar}
        textoFinalizar="Finalizar Compra"
        onFinalizar={handleFinalizar}
      />

      {venda.erro && <Alert type="error" message={venda.erro} />}

      {/* 2. Área Central: Formulário Principal (Esquerda) + Checkout (Direita) */}
      <div className="w-full min-w-0 flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Formulário Principal (Esquerda) */}
        <div className="flex-1 min-w-0 w-full bg-surface rounded-lg border border-border p-5 shadow-xs flex flex-col gap-5">
          <InfoAluno aluno={dadosAluno} />

          {/* Seção Avulsos (Armário e Contribuição) */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <ArmarioVenda
              armario={venda.armario}
              onChange={venda.setArmarioIncluido}
              disabled={desabilitado}
            />
            <ContribuicaoVoluntaria
              contribuicao={venda.contribuicao}
              onChange={venda.setContribuicao}
              disabled={desabilitado}
            />
          </div>

          {/* Seção Uniformes */}
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <h3 className="font-semibold text-text-primary">Uniformes</h3>
            <SelectUniformes
              uniformes={venda.uniformes}
              onAdicionar={venda.adicionarUniforme}
              disabled={desabilitado}
            />
            <ListaUniformes
              items={venda.items}
              onAlterarComprada={venda.alterarQuantidadeComprada}
              onAlterarRetirada={venda.alterarQuantidadeRetirada}
              onExcluir={venda.excluirUniforme}
              disabled={desabilitado}
            />
          </div>
        </div>

        {/* 3. Coluna Direita (Checkout Integrado: Resumo + Pagamento) */}
        <div className="w-full lg:w-80 shrink-0 bg-surface rounded-lg border border-border p-4 shadow-xs flex flex-col gap-3">
          <ResumoCompra
            aluno={dadosAluno}
            items={venda.items}
            armario={venda.armario}
            contribuicao={venda.contribuicao}
            totalCompra={venda.totalCompra}
          />

          <div className="border-t border-border pt-3 mt-auto">
            <FormasPagamento
              formas={venda.formasPagamento}
              pagamentosSelecionados={venda.pagamentosSelecionados}
              valores={venda.valores}
              totalCompra={venda.totalCompra}
              diferencaPagamento={venda.diferencaPagamento}
              onAlternarForma={venda.alterarFormaPagamento}
              onAlterarValor={venda.alterarValorPagamento}
              disabled={desabilitado}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApmMain;
