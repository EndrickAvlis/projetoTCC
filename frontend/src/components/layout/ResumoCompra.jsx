// Resumo dos itens, contribuição, armário e total da venda da APM.
import { formatarMoeda } from "../../utils/formatters";

const ResumoCompra = ({ aluno, itens = [], armario, valorContribuicao = 0, total = 0 }) => {
  const totalUniformes = itens.reduce((soma, item) => soma + item.preco * item.quantidadeComprada, 0);

  return (
    <aside className="w-full bg-white border border-border rounded-lg p-5 xl:sticky xl:top-0 xl:self-start" aria-label="Resumo da compra">
      <h2 className="text-section font-semibold text-primary border-b border-border pb-3">Resumo da compra</h2>
      <div className="py-4 border-b border-border text-sm text-gray-700 space-y-1">
        <p><span className="text-gray-500">Nome:</span> <strong>{aluno.nome || "Aluno não identificado"}</strong></p>
        <p><span className="text-gray-500">CPF:</span> <strong>{aluno.cpf || "—"}</strong></p>
      </div>
      <div className="py-4 border-b border-border text-sm space-y-2">
        <ResumoLinha titulo="Uniformes" valor={formatarMoeda(totalUniformes)} />
        {itens.map((item) => {
          const pendente = item.quantidadeComprada - item.quantidadeRetirada;
          return <p key={item.id} className="pl-2 text-xs text-gray-600">
            {item.tamanho}: {item.quantidadeComprada} comprado(s), {item.quantidadeRetirada} retirado(s)
            {pendente > 0 && `, ${pendente} pendente(s)`}
          </p>;
        })}
        <ResumoLinha titulo="Armário" valor={formatarMoeda(armario.incluido ? armario.preco : 0)} />
        <ResumoLinha titulo="Contribuição" valor={formatarMoeda(valorContribuicao)} />
      </div>
      <div className="pt-4 flex items-center justify-between gap-4">
        <span className="text-section font-bold text-primary">Total</span>
        <strong className="text-2xl font-bold text-primary">{formatarMoeda(total)}</strong>
      </div>
    </aside>
  );
};

const ResumoLinha = ({ titulo, valor }) => <div className="flex justify-between gap-4 text-gray-700"><span>{titulo}</span><span>{valor}</span></div>;

export default ResumoCompra;
