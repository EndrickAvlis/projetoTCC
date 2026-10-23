import Card from "../../../../../components/ui/Card";
import Badge from "../../../../../components/ui/Badge";

const HORARIOS = [
  "07h",
  "08h",
  "09h",
  "10h",
  "11h",
  "12h",
  "13h",
  "14h",
  "15h",
  "16h",
  "17h",
  "18h",
];

const GraficoFinalizadasHora = ({ dados = [], periodoRotulo = "Hoje" }) => {
  const mapaValores = new Map(dados.map((d) => [d.hora, d.quantidade]));
  const itens = HORARIOS.map((hora) => ({
    hora,
    quantidade: mapaValores.get(hora) ?? 0,
  }));

  const maximo = Math.max(...itens.map((i) => i.quantidade), 1);

  return (
    <Card
      titulo="Senhas finalizadas por horário"
      acoes={
        <Badge variant="primary" size="sm">
          {periodoRotulo}
        </Badge>
      }
      className="w-full"
    >
      <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2">
        {itens.map((item) => {
          const porcentagem = (item.quantidade / maximo) * 100;
          const alturaMinima =
            item.quantidade > 0 ? Math.max(porcentagem, 8) : 3;

          return (
            <div
              key={item.hora}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
            >
              <div className="absolute -top-7 hidden group-hover:flex items-center px-2 py-0.5 rounded bg-text-primary text-text-inverse text-[11px] font-medium whitespace-nowrap shadow-md pointer-events-none z-10">
                {item.quantidade} finalizada{item.quantidade === 1 ? "" : "s"} (
                {item.hora})
              </div>

              <div
                style={{ height: `${alturaMinima}%` }}
                className={`w-full max-w-7 rounded-t-sm transition-all duration-300 ${
                  item.quantidade > 0
                    ? "bg-primary group-hover:bg-primary-hover"
                    : "bg-border/60"
                }`}
              />

              <span className="text-[11px] text-text-secondary mt-2 tabular-nums">
                {item.hora}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default GraficoFinalizadasHora;
