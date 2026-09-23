import * as React from "react";
import { FiSearch, FiUserPlus, FiX } from "react-icons/fi";
import { useBuscaAlunos } from "../../hooks/useBuscaAlunos";
import Button from "../../../../components/ui/button";
import Input from "../../../../components/ui/input";

export const BuscarAlunos = ({
  onSelecionarAluno,
  onNovoAluno,
  disabled = false,
  className = "",
}) => {
  const { busca, setBusca, alunos, carregando, erro, limparBusca } =
    useBuscaAlunos();

  const [aberto, setAberto] = React.useState(false);
  const [indiceFocado, setIndiceFocado] = React.useState(-1);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickFora = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setAberto(false);
      }
    };

    document.addEventListener("mousedown", handleClickFora);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, []);

  const handleSelecionar = (aluno) => {
    if (onSelecionarAluno) {
      onSelecionarAluno(aluno);
    }
    limparBusca();
    setAberto(false);
    setIndiceFocado(-1);
  };

  const handleKeyDown = (event) => {
    if (!aberto || alunos.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndiceFocado((anterior) =>
        anterior < alunos.length - 1 ? anterior + 1 : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndiceFocado((anterior) =>
        anterior > 0 ? anterior - 1 : alunos.length - 1,
      );
    } else if (event.key === "Enter" && indiceFocado >= 0) {
      event.preventDefault();
      handleSelecionar(alunos[indiceFocado]);
    } else if (event.key === "Escape") {
      setAberto(false);
    }
  };

  return (
    <div className={`flex w-full items-center gap-3 ${className}`}>
      <div ref={containerRef} className="relative flex-1">
        <div className="relative flex items-center">
          <Input
            icon={<FiSearch />}
            iconPosition="left"
            placeholder="Digite o nome do aluno..."
            value={busca}
            onChange={(e) => {
              const valor = e.target.value;
              setBusca(valor);
              setAberto(valor.trim().length >= 2);
              setIndiceFocado(-1);
            }}
            onFocus={() => busca.trim().length >= 2 && setAberto(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />

          {busca.length > 0 && (
            <button
              type="button"
              onClick={() => {
                limparBusca();
                setAberto(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none p-1 rounded cursor-pointer"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>

        {aberto && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-surface shadow-lg">
            {carregando && (
              <div className="p-3 text-center text-sm text-text-secondary">
                Buscando alunos...
              </div>
            )}

            {erro && (
              <div className="p-3 text-center text-sm text-status-danger">
                {erro}
              </div>
            )}

            {!carregando && !erro && alunos.length === 0 && (
              <div className="p-3 text-center text-sm text-text-secondary">
                Nenhum aluno encontrado.
              </div>
            )}

            {!erro && (
              <div className="divide-y divide-border/60">
                {alunos.map((aluno, index) => {
                  const curso = aluno.matriculas?.[0]?.curso;

                  return (
                    <div
                      key={aluno.id}
                      onClick={() => handleSelecionar(aluno)}
                      onMouseEnter={() => setIndiceFocado(index)}
                      className={`cursor-pointer px-4 py-3 text-sm transition-colors ${
                        index === indiceFocado
                          ? "bg-surface-muted text-primary"
                          : "text-text-primary hover:bg-surface-muted"
                      }`}
                    >
                      <div className="font-semibold text-text-primary">
                        {aluno.nome}
                      </div>
                      {curso && (
                        <div className="text-xs text-text-secondary mt-0.5">
                          {curso}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {onNovoAluno && (
        <Button
          type="button"
          variant="secondary"
          size="md"
          leftIcon={<FiUserPlus />}
          onClick={onNovoAluno}
          disabled={disabled}
          className="whitespace-nowrap"
        >
          Cadastrar novo aluno
        </Button>
      )}
    </div>
  );
};

export default BuscarAlunos;
