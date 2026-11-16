import * as React from "react";
import { FiShoppingBag } from "react-icons/fi";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import BuscarAlunos from "../../postos/components/triagem/BuscarAlunos";
import InfoAluno from "../../postos/components/apm/InfoAluno";
import SelectUniformes from "../../postos/components/apm/SelectUniformes";
import ListaUniformes from "../../postos/components/apm/ListaUniformes";
import FormasPagamento from "../../postos/components/apm/FormasPagamento";
import ResumoCompra from "../../postos/components/apm/ResumoCompra";
import { useVenda } from "../../postos/hooks/useVenda";
import { registrarVenda } from "../services/secretariaService";
import { useToast } from "../../../context/toastContext";

const SecaoVenda = ({ onVendaRealizada }) => {
  const toast = useToast();
  const venda = useVenda();
  const [alunoSelecionado, setAlunoSelecionado] = React.useState(null);
  const [salvando, setSalvando] = React.useState(false);

  const handleTrocarAluno = () => {
    setAlunoSelecionado(null);
    venda.limparVenda();
  };

  const podeFinalizar =
    Boolean(alunoSelecionado?.id) &&
    venda.uniformes.selecionados.length > 0 &&
    venda.pagamento.podeFinalizar &&
    !salvando;

  const handleFinalizarCompra = async () => {
    if (!podeFinalizar) return;

    try {
      setSalvando(true);
      await registrarVenda({
        codAluno: alunoSelecionado.id,
        ...venda.gerarPayload(),
      });

      toast.confirmacao("Venda efetuada com sucesso");
      venda.limparVenda();
      setAlunoSelecionado(null);
      venda.catalogo.carregarProdutos({ silencioso: true });
      onVendaRealizada?.();
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const desabilitado = venda.catalogo.carregando || salvando;

  return (
    <div className="flex flex-col gap-5">
      {venda.catalogo.erro && <Alert type="error" message={venda.catalogo.erro} />}

      {!alunoSelecionado ? (
        <div className="bg-surface rounded-xl border border-border p-6 shadow-xs flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Iniciar Venda Avulsa
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Pesquise e selecione o aluno para o qual a venda de uniformes será registrada.
            </p>
          </div>

          <div className="max-w-xl">
            <BuscarAlunos onSelecionarAluno={setAlunoSelecionado} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="flex-1 w-full bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <InfoAluno aluno={alunoSelecionado} />
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleTrocarAluno}
                disabled={salvando}
              >
                Trocar Aluno
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-text-primary">
                Adicionar Uniforme
              </h4>
              <SelectUniformes
                uniformes={venda.uniformes.disponiveis}
                onAdicionar={venda.uniformes.adicionar}
                disabled={desabilitado}
              />
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-bold text-text-primary">
                Uniformes Selecionados
              </h4>
              {venda.uniformes.selecionados.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-text-secondary">
                  Nenhum uniforme adicionado. Selecione os itens acima para montar a compra.
                </div>
              ) : (
                <ListaUniformes
                  items={venda.uniformes.selecionados}
                  onAlterarComprada={venda.uniformes.alterarComprada}
                  onAlterarRetirada={venda.uniformes.alterarRetirada}
                  onExcluir={venda.uniformes.remover}
                  disabled={salvando}
                />
              )}
            </div>
          </div>

          <div className="w-full lg:w-84 shrink-0 bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col gap-5">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleFinalizarCompra}
              disabled={!podeFinalizar}
              rightIcon={<FiShoppingBag />}
            >
              {salvando ? "Finalizando..." : "Finalizar Compra"}
            </Button>

            <ResumoCompra
              aluno={alunoSelecionado}
              items={venda.uniformes.selecionados}
              totalCompra={venda.pagamento.total}
            />

            <div className="border-t border-border pt-3">
              <FormasPagamento
                formas={venda.pagamento.formas}
                pagamentosSelecionados={venda.pagamento.selecionados}
                valores={venda.pagamento.valores}
                totalCompra={venda.pagamento.total}
                diferencaPagamento={venda.pagamento.diferenca}
                onAlternarForma={venda.pagamento.alternarForma}
                onAlterarValor={venda.pagamento.alterarValor}
                disabled={salvando || venda.uniformes.selecionados.length === 0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecaoVenda;
