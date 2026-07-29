// Lista visual da senha atual e das próximas senhas aguardando atendimento.
const ListLine = ({ senhas, variant = "sidepanel", senhaAtual }) => {
  const variantStyles = {
    sidepanel: {
      container: "flex flex-col gap-1",
      maxItens: 6,
    },
  };

  const estilo = variantStyles[variant];
  // INTEGRAÇÃO BACKEND: a API já fornece somente senhas aguardando, na ordem
  // correta. O componente apenas limita quantas delas serão exibidas.
  const proximas = senhas.slice(0, estilo.maxItens);

  return (
    <div className={estilo.container}>
      {senhaAtual && (
        <div className="bg-primary text-white w-full px-4 py-3 flex flex-col items-start">
          <div className="text-[0.9rem] text-white/60 uppercase tracking-wider mb-1 font-bold">
            Em atendimento
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-[1.5rem] font-bold tracking-wider">
              {senhaAtual.numero}
            </span>
            <span className="text-[1.2rem] text-white/60">
              {senhaAtual.horario}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1 mx-4 my-5">
        <div className="uppercase text-[0.9rem] font-semibold text-gray-400 tracking-wider my-1">
          Próximas
        </div>
        {proximas.length > 0 ? (
          proximas.map((senha) => (
            <div
              key={senha.numero}
              className="w-full h-15 bg-background flex border border-border rounded-btn justify-between items-center px-2 py-1.5"
            >
              <span className="font-bold text-primary text-[1.2rem]">
                {senha.numero}
              </span>
              <span className="text-[0.9rem] opacity-80 text-gray-500">
                {senha.horario}
              </span>
            </div>
          ))
        ) : (
          <p className="flex justify-center items-center w-full h-13 mt-3 bg-background border border-border rounded-btn text-sm text-gray-400 italic py-2 px-2">
            Nenhuma senha na fila
          </p>
        )}
      </div>
    </div>
  );
};

export default ListLine;
