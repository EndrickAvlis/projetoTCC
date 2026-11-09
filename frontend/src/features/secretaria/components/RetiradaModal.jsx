import * as React from "react";
import { FiPlus, FiMinus, FiCheckCircle } from "react-icons/fi";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import { formatarDataHora } from "../../../utils/formatters";
import { registrarRetirada } from "../services/secretariaService";
import { useToast } from "../../../context/toastContext";

const formatarPeriodo = (periodo) => {
  switch (periodo) {
    case "manha":
      return "Manhã";
    case "tarde":
      return "Tarde";
    case "noite":
      return "Noite";
    case "integral":
      return "Integral";
    case "online":
      return "EAD - Online";
    default:
      return periodo || "Não informado";
  }
};

const RetiradaModal = ({ aberto, onFechar, compra, onSucesso }) => {
  const toast = useToast();
  const [quantidades, setQuantidades] = React.useState({});
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState(null);

  const itensNormalizados = React.useMemo(() => {
    if (!compra?.itens) return [];
    return compra.itens.map((item) => {
      const produtoId = item.produtoId ?? item.codProduto;
      const nome = item.nome ?? item.produto?.nomeProduto ?? "Uniforme";
      const comprada = item.quantidadeComprada ?? item.quantidadeItem ?? 0;
      const retirada = item.quantidadeRetirada ?? item.quantidadeRetiradaItem ?? 0;
      const pendente = item.quantidadePendente ?? Math.max(0, comprada - retirada);
      const estoque = item.estoque ?? item.produto?.quantidadeProduto ?? 0;

      return {
        produtoId,
        nome,
        quantidadeComprada: comprada,
        quantidadeRetirada: retirada,
        quantidadePendente: pendente,
        estoque,
      };
    });
  }, [compra]);

  React.useEffect(() => {
    if (aberto) {
      setQuantidades({});
      setErro(null);
    }
  }, [aberto, compra?.id]);

  if (!aberto || !compra) return null;

  const alterarQtdRetirar = (produtoId, delta, maximo) => {
    setQuantidades((prev) => {
      const atual = prev[produtoId] || 0;
      const nova = Math.max(0, Math.min(maximo, atual + delta));
      return { ...prev, [produtoId]: nova };
    });
  };

  const handleRetirarTudoDisponivel = () => {
    const novasQtds = {};
    for (const item of itensNormalizados) {
      if (item.quantidadePendente > 0) {
        novasQtds[item.produtoId] = Math.min(item.quantidadePendente, item.estoque);
      }
    }
    setQuantidades(novasQtds);
  };

  const totalRetirarAgora = Object.values(quantidades).reduce(
    (acc, val) => acc + (val || 0),
    0,
  );

  const handleConfirmar = async () => {
    if (totalRetirarAgora <= 0) return;

    const itensParaEnviar = Object.entries(quantidades)
      .filter(([, qtd]) => qtd > 0)
      .map(([produtoId, quantidade]) => ({
        produtoId: Number(produtoId),
        quantidade,
      }));

    try {
      setSalvando(true);
      setErro(null);
      await registrarRetirada(compra.id, itensParaEnviar);
      toast.sucesso("Retirada registrada com sucesso!");
      onSucesso?.();
      onFechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const aluno = compra.aluno;
  const cursoDescricao = [
    aluno?.curso,
    aluno?.periodo ? formatarPeriodo(aluno.periodo) : null,
    aluno?.ano ? `${aluno.ano}º Ano` : null,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <Modal
      aberto={aberto}
      onFechar={salvando ? undefined : onFechar}
      titulo="Registrar Retirada de Uniformes"
      largura="max-w-2xl"
      conteudoRolavel={false}
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <div className="text-sm font-semibold text-text-secondary">
            {totalRetirarAgora > 0 ? (
              <span>
                Total a entregar agora:{" "}
                <strong className="text-primary">{totalRetirarAgora} {totalRetirarAgora === 1 ? "peça" : "peças"}</strong>
              </span>
            ) : (
              <span>Selecione os itens a serem entregues</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onFechar}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmar}
              disabled={salvando || totalRetirarAgora <= 0}
              rightIcon={<FiCheckCircle />}
            >
              {salvando ? "Confirmando..." : "Confirmar Retirada"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-sm">
        {erro && <Alert type="error" message={erro} onClose={() => setErro(null)} />}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted/60 p-4 border border-border/60">
          <div>
            <p className="text-xs uppercase font-semibold text-text-secondary">
              Código da Compra
            </p>
            <p className="text-base font-bold text-primary font-mono tracking-wider">
              {compra.codigo || compra.codigoRetirada || `#${compra.id}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-secondary">Data da Compra</p>
            <p className="font-medium text-text-primary">
              {formatarDataHora(compra.dataHoraCompra || compra.dataHora)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 flex flex-col gap-1">
          <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">
            Aluno
          </p>
          <p className="text-base font-bold text-text-primary">
            {aluno?.nome || "Aluno não identificado"}
          </p>
          {cursoDescricao && (
            <p className="text-xs text-text-secondary">
              {cursoDescricao}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-text-primary">
              Itens da Compra
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRetirarTudoDisponivel}
              disabled={salvando}
            >
              Retirar tudo disponível
            </Button>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border text-text-secondary">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Uniforme</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Comprado</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Já Retirado</th>
                  <th className="py-2.5 px-2 text-center font-semibold text-status-warning">Pendente</th>
                  <th className="py-2.5 px-2 text-center font-semibold">Estoque</th>
                  <th className="py-2.5 px-3 text-center font-semibold">Entregar Agora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {itensNormalizados.map((item) => {
                  const maxDisponivel = Math.min(item.quantidadePendente, item.estoque);
                  const qtdAtual = quantidades[item.produtoId] || 0;
                  const semEstoque = item.estoque <= 0 && item.quantidadePendente > 0;

                  return (
                    <tr key={item.produtoId} className="hover:bg-surface-muted/30">
                      <td className="py-2.5 px-3 font-semibold text-text-primary">
                        {item.nome}
                      </td>
                      <td className="py-2.5 px-2 text-center text-text-secondary font-medium">
                        {item.quantidadeComprada}
                      </td>
                      <td className="py-2.5 px-2 text-center text-text-secondary">
                        {item.quantidadeRetirada}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-status-warning">
                        {item.quantidadePendente}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`font-semibold ${
                            semEstoque
                              ? "text-status-danger"
                              : "text-text-primary"
                          }`}
                        >
                          {item.estoque}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {item.quantidadePendente === 0 ? (
                          <span className="text-status-success font-semibold text-[11px]">
                            Totalmente retirado
                          </span>
                        ) : semEstoque ? (
                          <span className="text-status-danger text-[11px] font-semibold">
                            Sem estoque
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={salvando || qtdAtual <= 0}
                              onClick={() =>
                                alterarQtdRetirar(item.produtoId, -1, maxDisponivel)
                              }
                              aria-label="Diminuir entrega"
                            >
                              <FiMinus className="text-xs" />
                            </Button>
                            <span className="min-w-6 text-center font-bold text-sm text-text-primary">
                              {qtdAtual}
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={salvando || qtdAtual >= maxDisponivel}
                              onClick={() =>
                                alterarQtdRetirar(item.produtoId, 1, maxDisponivel)
                              }
                              aria-label="Aumentar entrega"
                            >
                              <FiPlus className="text-xs" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RetiradaModal;
