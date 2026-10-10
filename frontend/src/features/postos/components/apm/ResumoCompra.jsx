import { FiShoppingBag } from "react-icons/fi";
import { formatarMoeda } from "../../../../utils/formatters";

const ResumoCompra = ({
  aluno,
  items = [],
  armario,
  contribuicao = 0,
  totalCompra = 0,
}) => {
  const totalUniformes = items.reduce(
    (acc, item) => acc + item.preco * item.quantidadeComprada,
    0,
  );

  return (
    <div className="flex flex-col gap-3" aria-label="Resumo da compra">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
          <FiShoppingBag className="text-primary" />
          Resumo da Compra
        </h3>
      </div>

      <div className="text-xs">
        <span className="text-text-secondary uppercase font-semibold text-[11px]">Aluno</span>
        <p className="font-bold text-text-primary truncate">
            Endrick Silva Souza
          {/* {aluno?.nome || "Não identificado"} */}
        </p>
      </div>

      <div className="space-y-2 pr-1 text-xs">
        <div>
          <div className="flex justify-between text-xs font-semibold text-text-secondary border-t border-border/50 pt-1.5">
            <span>Uniformes</span>
            <span className="text-text-primary">{formatarMoeda(totalUniformes)}</span>
          </div>
          {items.map((item) => {
            const pendente = item.quantidadeComprada - item.quantidadeRetirada;
            return (
              <div key={item.id} className="mt-1 pl-2 text-xs text-text-primary">
                <span className="font-semibold">{item.tamanho}:</span> {item.quantidadeComprada}x ({item.quantidadeRetirada} retirado{item.quantidadeRetirada === 1 ? "" : "s"})
                {pendente > 0 && (
                  <span className="block text-[11px] font-semibold text-status-warning">
                    {pendente} {pendente === 1 ? "pendente" : "pendentes"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {armario?.incluido && (
          <div className="flex justify-between text-xs font-semibold text-text-secondary border-t border-border/50 pt-1.5">
            <span>Armário</span>
            <span className="text-text-primary">{formatarMoeda(armario.preco)}</span>
          </div>
        )}

        {contribuicao > 0 && (
          <div className="flex justify-between text-xs font-semibold text-text-secondary border-t border-border/50 pt-1.5">
            <span>Contribuição</span>
            <span className="text-text-primary font-semibold">{formatarMoeda(contribuicao)}</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between">
        <span className="text-xl font-bold text-text-primary">Total</span>
        <strong className="text-xl font-black text-primary">
          {formatarMoeda(totalCompra)}
        </strong>
      </div>
    </div>
  );
};

export default ResumoCompra;