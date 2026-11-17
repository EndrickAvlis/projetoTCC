import Modal from "../../../../components/ui/Modal";
import {
  formatarMoeda,
  formatarDataHora,
  formatarPeriodo,
} from "../../../../utils/formatters";

const LABELS_PAGAMENTO = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  debito: "Cartão de Débito",
  credito: "Cartão de Crédito",
};

const formatarItem = (item) => {
  if (item === "Armário" || item === "Armário Individual") {
    return item;
  }
  return `Uniforme ${item}`;
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
      largura="max-w-180"
      conteudoRolavel={false}
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

            <div>
              <p className="text-xs uppercase font-semibold text-text-secondary">Atendente</p>
              <p className="font-semibold text-text-primary">
                {venda.atendente}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-text-secondary">Data/Hora da venda</p>
              <p className="font-medium text-text-primary">
                {formatarDataHora(venda.dataHora)}
              </p>
            </div>
          </div>

          <div className="flex justify-between p-3">
            <div className="max-w-55">
              <p className="text-sm text-text-secondary">Aluno</p>
              <p className="font-semibold text-text-primary">
                {venda.aluno || "Não informado"}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">Curso</p>
              <p className="font-semibold text-text-primary">
                {venda.curso || "Não informado"}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">Período</p>
              <p className="font-semibold capitalize text-text-primary">
                {formatarPeriodo(venda.periodo) || "Não informado"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">
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
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">
              Formas de pagamento
            </p>
            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
              {venda.pagamentos?.length > 0 && (
                <div className="divide-y divide-border text-xs">
                  {venda.pagamentos.map((pagamento, idx) => (
                    <div
                      key={`${pagamento.tipo}-${idx}`}
                      className="flex items-center justify-between px-4 py-2.5"
                    >
                      <span className="font-medium text-text-secondary">
                        {LABELS_PAGAMENTO[pagamento.tipo] ?? pagamento.tipo}
                      </span>
                      <span className="font-semibold text-text-primary">
                        {formatarMoeda(pagamento.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between bg-surface-muted/60 px-4 py-3">
                <span className="text-sm font-semibold text-text-secondary">
                  Total da Venda
                </span>
                <span className="text-xl font-extrabold text-primary">
                  {formatarMoeda(venda.precoTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VendaDetalhesModal;
