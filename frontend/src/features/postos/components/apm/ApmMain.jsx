import { useToast } from "../../../../context/toastContext";
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
import * as React from "react";

const ApmMain = () => {
  const toast = useToast();
  const { senhaAtual, dadosAluno, fase, finalizarAtendimento } =
    useAtendimento();
  const venda = useVenda();
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    if (!senhaAtual || fase !== "iniciada") {
      venda.limparVenda();
    }
  }, [senhaAtual?.id, fase]);

  const desabilitado =
    !senhaAtual || fase !== "iniciada" || venda.catalogo.carregando || salvando;

  const podeFinalizar =
    fase === "iniciada" &&
    Boolean(dadosAluno?.id) &&
    venda.pagamento.podeFinalizar &&
    !salvando;

  const handleFinalizar = async () => {
    if (!dadosAluno?.id) return;

    try {
      setSalvando(true);
      if (venda.pagamento.total > 0) {
        await ApmService.registrarVenda({
          codAluno: dadosAluno.id,
          ...venda.gerarPayload(),
        });
      }
      await finalizarAtendimento();
      venda.limparVenda();
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <AtendimentoActions
        podeFinalizar={podeFinalizar}
        textoFinalizar={salvando ? "Finalizando..." : "Finalizar Compra"}
        onFinalizar={handleFinalizar}
      />

      {venda.catalogo.erro && <Alert type="error" message={venda.catalogo.erro} />}
      {fase !== "iniciada" || !dadosAluno ? (
        <div className="bg-surface rounded-lg border border-border p-6 shadow-xs">
          <p className="py-12 text-center text-text-secondary">
            {fase === "chamada"
              ? "Inicie o atendimento da senha chamada para registrar a venda da APM."
              : "Aguardando chamada de uma senha para atendimento na APM."}
          </p>
        </div>
      ) : (
        <div className="w-full min-w-0 flex flex-col lg:flex-row gap-5 items-stretch">
          <div className="flex-1 min-w-0 w-full bg-surface rounded-lg border border-border p-5 shadow-xs flex flex-col gap-5">
            <InfoAluno aluno={dadosAluno} />
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <ArmarioVenda
                armario={venda.armario}
                onChange={venda.armario.setIncluido}
                disabled={desabilitado}
              />
              <ContribuicaoVoluntaria
                contribuicao={venda.contribuicao.valor}
                onChange={venda.contribuicao.setValor}
                disabled={desabilitado}
              />
            </div>
            <div className="flex flex-col gap-4 border-t border-border pt-4">
              <h3 className="font-semibold text-text-primary">Uniformes</h3>
              <SelectUniformes
                uniformes={venda.uniformes.disponiveis}
                onAdicionar={venda.uniformes.adicionar}
                disabled={desabilitado}
              />
              <ListaUniformes
                items={venda.uniformes.selecionados}
                onAlterarComprada={venda.uniformes.alterarComprada}
                onAlterarRetirada={venda.uniformes.alterarRetirada}
                onExcluir={venda.uniformes.remover}
                disabled={desabilitado}
              />
            </div>
          </div>
          <div className="w-full lg:w-80 shrink-0 bg-surface rounded-lg border border-border p-4 shadow-xs flex flex-col gap-3">
            <ResumoCompra
              aluno={dadosAluno}
              items={venda.uniformes.selecionados}
              armario={venda.armario}
              contribuicao={venda.contribuicao.valor}
              totalCompra={venda.pagamento.total}
            />
            <div className="border-t border-border pt-3 mt-auto">
              <FormasPagamento
                formas={venda.pagamento.formas}
                pagamentosSelecionados={venda.pagamento.selecionados}
                valores={venda.pagamento.valores}
                totalCompra={venda.pagamento.total}
                diferencaPagamento={venda.pagamento.diferenca}
                onAlternarForma={venda.pagamento.alternarForma}
                onAlterarValor={venda.pagamento.alterarValor}
                disabled={desabilitado}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApmMain;
