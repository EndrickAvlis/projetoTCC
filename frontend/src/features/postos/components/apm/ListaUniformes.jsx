import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import DataTable from "../../../../components/ui/DataTable";
import Button from "../../../../components/ui/Button";
import { formatarMoeda } from "../../../../utils/formatters";

const ListaUniformes = ({
  items = [],
  onAlterarComprada,
  onAlterarRetirada,
  onExcluir,
  disabled = false,
}) => {
  if (items.length === 0) return null;

  const colunas = [
    {
      key: "tamanho",
      label: "Tamanho",
      cellClassName: "font-semibold text-text-primary",
      render: (item) => {
        const pendente = item.quantidadeComprada - item.quantidadeRetirada;

        return (
          <div className="flex items-center gap-2">
            <span>{item.tamanho}</span>
            {pendente > 0 && (
              <span className="rounded-sm bg-status-warning-bg px-1.5 py-0.5 text-xs font-semibold text-status-warning whitespace-nowrap">
                {pendente} {pendente === 1 ? "pendente" : "pendentes"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "preco",
      label: "Preço",
      cellClassName: "text-text-secondary",
      render: (item) => formatarMoeda(item.preco),
    },
    {
      key: "quantidadeComprada",
      label: "Qtd. Comprada",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled || item.quantidadeComprada <= 1}
            onClick={() => onAlterarComprada(item.id, -1)}
            aria-label="Diminuir compra"
          >
            <FiMinus />
          </Button>
          <span className="min-w-6 text-center font-bold text-text-primary">
            {item.quantidadeComprada}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={() => onAlterarComprada(item.id, 1)}
            aria-label="Aumentar compra"
          >
            <FiPlus />
          </Button>
        </div>
      ),
    },
    {
      key: "quantidadeRetirada",
      label: "Qtd. Retirada",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (item) => {
        const limiteRetirada = Math.min(item.quantidadeComprada, item.estoque);

        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={disabled || item.quantidadeRetirada <= 0}
              onClick={() => onAlterarRetirada(item.id, -1)}
              aria-label="Diminuir retirada"
            >
              <FiMinus />
            </Button>
            <span className="min-w-6 text-center font-bold text-text-primary">
              {item.quantidadeRetirada}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={disabled || item.quantidadeRetirada >= limiteRetirada}
              onClick={() => onAlterarRetirada(item.id, 1)}
              aria-label="Aumentar retirada"
            >
              <FiPlus />
            </Button>
          </div>
        );
      },
    },
    {
      key: "subtotal",
      label: "Subtotal",
      cellClassName: "font-semibold text-primary",
      render: (item) => formatarMoeda(item.preco * item.quantidadeComprada),
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
          disabled={disabled}
          onClick={() => onExcluir(item.id)}
          aria-label={`Excluir ${item.tamanho}`}
        >
          <FiTrash2 />
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={colunas}
      data={items}
      getRowKey={(item) => item.id}
      alturaMaxima="none"
    />
  );
};

export default ListaUniformes;