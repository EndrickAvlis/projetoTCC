// Tabela dos uniformes selecionados e controles de quantidade e retirada.
import Button from "../../ui/Button";
import { IoMdAdd, IoMdRemove, IoMdTrash } from "react-icons/io";
import { formatarMoeda } from "../../../utils/formatters";

const ListaUniformes = ({ itens, onAlterarComprada, onAlterarRetirada, onExcluir, disabled = false }) => {
  if (!itens.length) return null;

  return (
    <section className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-185 text-sm">
          <thead className="bg-surface-muted text-primary text-left">
            <tr>
              <th className="p-3">Tamanho</th>
              <th className="p-3">Preço unit.</th>
              <th className="p-3">Qtd. comprada</th>
              <th className="p-3">Qtd. retirada</th>
              <th className="p-3">Subtotal</th>
              <th className="p-3"><span className="sr-only">Excluir</span></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => {
              const limiteRetirada = Math.min(item.quantidadeComprada, item.estoque);
              const pendente = item.quantidadeComprada - item.quantidadeRetirada;
              return (
                <tr key={item.id} className="border-t border-border">
                  <td className="p-3 font-semibold">{item.tamanho}</td>
                  <td className="p-3">{formatarMoeda(item.preco)}</td>
                  <td className="p-3"><ControleQuantidade valor={item.quantidadeComprada} onDiminuir={() => onAlterarComprada(item.id, -1)} onAumentar={() => onAlterarComprada(item.id, 1)} desabilitarDiminuir={disabled || item.quantidadeComprada <= 1} disabled={disabled} /></td>
                  <td className="p-3">
                    <ControleQuantidade valor={item.quantidadeRetirada} onDiminuir={() => onAlterarRetirada(item.id, -1)} onAumentar={() => onAlterarRetirada(item.id, 1)} desabilitarDiminuir={disabled || item.quantidadeRetirada <= 0} desabilitarAumentar={disabled || item.quantidadeRetirada >= limiteRetirada} disabled={disabled} />
                    {pendente > 0 && <p className="mt-1 text-xs text-status-warning">{pendente} pendente(s)</p>}
                  </td>
                  <td className="p-3 font-semibold">{formatarMoeda(item.preco * item.quantidadeComprada)}</td>
                  <td className="p-3 text-right"><Button variant="danger" size="sm" disabled={disabled} onClick={() => onExcluir(item.id)} aria-label={`Excluir uniforme tamanho ${item.tamanho}`}><IoMdTrash size={18} /></Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const ControleQuantidade = ({ valor, onDiminuir, onAumentar, desabilitarDiminuir, desabilitarAumentar, disabled }) => (
  <div className="flex items-center gap-2">
    <Button size="sm" variant="secondary" disabled={disabled || desabilitarDiminuir} onClick={onDiminuir} aria-label="Diminuir quantidade"><IoMdRemove /></Button>
    <span className="min-w-5 text-center">{valor}</span>
    <Button size="sm" variant="secondary" disabled={disabled || desabilitarAumentar} onClick={onAumentar} aria-label="Aumentar quantidade"><IoMdAdd /></Button>
  </div>
);

export default ListaUniformes;
