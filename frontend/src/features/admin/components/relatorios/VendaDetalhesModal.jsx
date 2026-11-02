import * as React from "react";
import Modal from "../../../../components/ui/Modal";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import { formatarMoeda, formatarDataHora } from "../../../../utils/formatters";

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
      return "Não Informado";
  }
};
const formatarItem = (item) => {
  if (item === "Armário Individual") {
    return "Armário";
  } else {
    return `Uniforme ${item}`;
  }
};

const VendaDetalhesModal = ({
  venda,
  aberto,
  onFechar,
  carregando = false,
}) => {
  if (!aberto) return null;

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Detalhe da Venda"
      largura="max-w-xl"
      conteudoRolavel={false}
      footer={
        venda ? (
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-md text-text-secondary font-semibold">
                Total:
              </span>
              <span className="text-xl font-extrabold text-primary">
                {formatarMoeda(venda.precoTotal)}
              </span>
              <Badge variant="neutral" className="text-xs">
                {venda.formaPagamento
                  ? `Pago via ${venda.formaPagamento.replace(",", " & ")}`
                  : "Não informado"}
              </Badge>
            </div>
            <Button variant="secondary" onClick={onFechar}>
              Fechar
            </Button>
          </div>
        ) : (
          <div className="flex justify-end w-full">
            <Button variant="secondary" onClick={onFechar}>
              Fechar
            </Button>
          </div>
        )
      }
    >
      {carregando ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">Carregando detalhes da venda...</p>
        </div>
      ) : !venda ? (
        <div className="py-8 text-center text-sm text-text-secondary">
          Nenhuma informação encontrada para esta venda.
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted/60 p-4 border border-border/60">
            <div>
              <p className="text-xs uppercase font-semibold text-text-secondary">
                Código de Retirada
              </p>
              <p className="text-base font-bold text-primary font-mono tracking-wider">
                {venda.codigoRetirada || "—"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-text-secondary">Data e Hora</p>
              <p className="font-medium text-text-primary">
                {formatarDataHora(venda.dataHora)}
              </p>
            </div>
          </div>

          <div className="flex justify-between p-3">
            <div className="max-w-50">
              <p className="text-xs text-text-secondary font-medium">Aluno</p>
              <p className="font-semibold text-text-primary">
                {venda.aluno || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">
                Curso / Período
              </p>
              <p className="font-semibold text-text-primary">
                {venda.curso || "Não informado"}
              </p>
              <p className="font-semibold capitalize text-text-primary">
                {formatarPeriodo(venda.periodo)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">
                Atendente
              </p>
              <p className="font-semibold text-text-primary">
                {venda.atendente || "Não informado"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-md font-semibold tracking-wider text-text-secondary mb-2">
              Itens da Compra
            </p>
            <div className="rounded-lg border border-border max-h-52 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-surface-muted border-b border-border text-text-secondary">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Item</th>
                    <th className="py-2 px-2 text-center font-semibold">Qtd</th>
                    <th className="py-2 px-3 text-right font-semibold">
                      Unitário
                    </th>
                    <th className="py-2 px-3 text-right font-semibold">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {venda.itens?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-medium text-text-primary">
                        {formatarItem(item.nome)}
                      </td>
                      <td className="py-2 px-2 text-center text-text-secondary">
                        {item.quantidade}
                      </td>
                      <td className="py-2 px-3 text-right text-text-secondary">
                        {formatarMoeda(item.preco)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-text-primary">
                        {formatarMoeda(item.quantidade * item.preco)}
                      </td>
                    </tr>
                  ))}
                  {Number(venda.contribuicao) > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-medium text-primary">
                        Contribuição Voluntária APM
                      </td>
                      <td className="py-2 px-2 text-center text-text-secondary">
                        1
                      </td>
                      <td className="py-2 px-3 text-right text-text-secondary">
                        {formatarMoeda(venda.contribuicao)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-primary">
                        {formatarMoeda(venda.contribuicao)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VendaDetalhesModal;
