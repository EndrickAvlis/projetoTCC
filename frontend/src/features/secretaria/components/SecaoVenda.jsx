import * as React from "react";
import { FiSearch, FiX, FiPlus, FiMinus, FiTrash2, FiUserCheck, FiShoppingBag } from "react-icons/fi";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Alert from "../../../components/ui/Alert";
import DataTable from "../../../components/ui/DataTable";
import SelectUniformes from "../../postos/components/apm/SelectUniformes";
import FormasPagamento from "../../postos/components/apm/FormasPagamento";
import InfoAluno from "../../postos/components/apm/InfoAluno";
import { useBuscaAlunos } from "../../postos/hooks/useBuscaAlunos";
import { useVenda } from "../hooks/useVenda";
import { registrarVenda } from "../services/secretariaService";
import { formatarMoeda } from "../../../utils/formatters";
import { useToast } from "../../../context/toastContext";

const SecaoVenda = ({ onVendaRealizada }) => {
  const toast = useToast();
  const venda = useVenda();
  const { busca, setBusca, alunos, carregando: buscando, erro: erroBusca, limparBusca } =
    useBuscaAlunos({ limite: 6 });

  const [alunoSelecionado, setAlunoSelecionado] = React.useState(null);
  const [dropdownAberto, setDropdownAberto] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const buscaContainerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickFora = (e) => {
      if (buscaContainerRef.current && !buscaContainerRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const handleSelecionarAluno = (aluno) => {
    setAlunoSelecionado(aluno);
    limparBusca();
    setDropdownAberto(false);
  };

  const handleTrocarAluno = () => {
    setAlunoSelecionado(null);
    venda.limparVenda();
  };

  const handleFinalizarCompra = async () => {
    if (!alunoSelecionado?.id || !venda.podeFinalizar || salvando) return;

    try {
      setSalvando(true);
      await registrarVenda({
        codAluno: alunoSelecionado.id,
        ...venda.payload(),
      });

      toast.sucesso("Venda avulsa registrada com sucesso!");
      venda.limparVenda();
      setAlunoSelecionado(null);
      venda.recarregarUniformes();
      onVendaRealizada?.();
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const colunasItens = [
    {
      key: "tamanho",
      label: "Tamanho",
      render: (item) => (
        <span className="font-semibold text-text-primary text-sm">
          {item.tamanho}
        </span>
      ),
    },
    {
      key: "preco",
      label: "Preço",
      render: (item) => (
        <span className="text-text-secondary text-sm">
          {formatarMoeda(item.preco)}
        </span>
      ),
    },
    {
      key: "quantidade",
      label: "Quantidade",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (item) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            disabled={salvando || item.quantidade <= 1}
            onClick={() => venda.alterarQuantidade(item.id, -1)}
            aria-label="Diminuir quantidade"
          >
            <FiMinus className="text-xs" />
          </Button>
          <span className="min-w-6 text-center font-bold text-text-primary">
            {item.quantidade}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={salvando || item.quantidade >= item.estoque}
            onClick={() => venda.alterarQuantidade(item.id, 1)}
            aria-label="Aumentar quantidade"
          >
            <FiPlus className="text-xs" />
          </Button>
        </div>
      ),
    },
    {
      key: "subtotal",
      label: "Subtotal",
      render: (item) => (
        <span className="font-bold text-primary text-sm">
          {formatarMoeda(item.preco * item.quantidade)}
        </span>
      ),
    },
    {
      key: "acoes",
      label: "Ação",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (item) => (
        <Button
          variant="danger"
          size="sm"
          disabled={salvando}
          onClick={() => venda.excluirUniforme(item.id)}
          aria-label={`Remover ${item.tamanho}`}
        >
          <FiTrash2 />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {venda.erro && <Alert type="error" message={venda.erro} />}

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

          <div ref={buscaContainerRef} className="relative max-w-xl">
            <div className="relative">
              <Input
                icon={<FiSearch />}
                iconPosition="left"
                placeholder="Digite o nome do aluno para buscar..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setDropdownAberto(e.target.value.trim().length >= 2);
                }}
                onFocus={() => busca.trim().length >= 2 && setDropdownAberto(true)}
                size="md"
              />

              {busca.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    limparBusca();
                    setDropdownAberto(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1 cursor-pointer"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>

            {dropdownAberto && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-surface shadow-lg">
                {buscando && (
                  <div className="p-3 text-center text-xs text-text-secondary">
                    Buscando alunos...
                  </div>
                )}

                {erroBusca && (
                  <div className="p-3 text-center text-xs text-status-danger">
                    {erroBusca}
                  </div>
                )}

                {!buscando && !erroBusca && alunos.length === 0 && (
                  <div className="p-3 text-center text-xs text-text-secondary">
                    Nenhum aluno encontrado.
                  </div>
                )}

                {!erroBusca &&
                  alunos.map((aluno) => (
                    <div
                      key={aluno.id}
                      onClick={() => handleSelecionarAluno(aluno)}
                      className="cursor-pointer px-4 py-2.5 text-sm hover:bg-surface-muted transition-colors border-b border-border/50 last:border-0"
                    >
                      <div className="font-semibold text-text-primary">
                        {aluno.nome}
                      </div>
                      {aluno.curso && (
                        <div className="text-xs text-text-secondary mt-0.5">
                          {aluno.curso}
                          {aluno.periodo ? ` — ${aluno.periodo}` : ""}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="flex-1 w-full bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
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
                uniformes={venda.uniformes}
                onAdicionar={venda.adicionarUniforme}
                disabled={salvando || venda.carregando}
              />
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-bold text-text-primary">
                Uniformes Selecionados
              </h4>
              {venda.items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-text-secondary">
                  Nenhum uniforme adicionado. Selecione os itens acima para montar a compra.
                </div>
              ) : (
                <DataTable
                  columns={colunasItens}
                  data={venda.items}
                  getRowKey={(item) => item.id}
                  alturaMaxima="none"
                />
              )}
            </div>
          </div>

          <div className="w-full lg:w-84 shrink-0 bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col gap-5">
            <h4 className="text-sm font-bold text-text-primary">
              Pagamento e Resumo
            </h4>

            <FormasPagamento
              formas={venda.formasPagamento}
              pagamentosSelecionados={venda.pagamentosSelecionados}
              valores={venda.valores}
              totalCompra={venda.totalCompra}
              diferencaPagamento={venda.diferencaPagamento}
              onAlternarForma={venda.alterarFormaPagamento}
              onAlterarValor={venda.alterarValorPagamento}
              disabled={salvando || venda.items.length === 0}
            />

            <div className="rounded-lg bg-surface-muted/60 p-4 border border-border/60 flex flex-col gap-2 text-sm">
              <div className="flex justify-between items-center text-text-secondary">
                <span>Subtotal Uniformes:</span>
                <span className="font-semibold text-text-primary">
                  {formatarMoeda(venda.totalCompra)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-border/60 pt-2 text-base font-bold">
                <span className="text-text-primary">Total:</span>
                <span className="text-primary">
                  {formatarMoeda(venda.totalCompra)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleFinalizarCompra}
              disabled={!venda.podeFinalizar || salvando || venda.items.length === 0}
              rightIcon={<FiShoppingBag />}
            >
              {salvando ? "Finalizando..." : "Finalizar Compra"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecaoVenda;
