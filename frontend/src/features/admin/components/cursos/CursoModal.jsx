import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../../components/ui/Alert";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import { PERIODOS_CURSO } from "../../../../constants/cursoOptions";

const dadosIniciais = () => ({
  periodo: "",
  vagasTotais: "",
  matriculaAtiva: true,
});

const CursoModal = ({
  aberto,
  curso,
  onFechar,
  onSalvar,
  salvando = false,
  erro = null,
}) => {
  const emEdicao = Boolean(curso);

  const [nome, setNome] = React.useState("");
  const [periodos, setPeriodos] = React.useState([dadosIniciais()]);
  const [erros, setErros] = React.useState({});

  React.useEffect(() => {
    if (aberto) {
      if (curso) {
        setNome(curso.nome || "");
      } else {
        setNome("");
        setPeriodos([dadosIniciais()]);
      }
      setErros({});
    }
  }, [aberto, curso]);

  //Somente ao criar curso
  const adicionarPeriodo = () => {
    if (periodos.length >= 5) return;
    setPeriodos((prevs) => [...prevs, dadosIniciais()]);
  };
  const removerPeriodo = (index) => {
    setPeriodos((prevs) => prevs.filter((_, indice) => indice !== index));
  };
  const atualizarPeriodo = (index, campo, value) => {
    setPeriodos((prevs) =>
      prevs.map((item, indice) =>
        indice === index ? { ...item, [campo]: value } : item,
      ),
    );
  };

  //Validar formulário
  const validarCursoForm = () => {
    const novosErros = {};
    if (!nome.trim()) {
      novosErros.nome = "Informe o nome do curso.";
    }
    if (!emEdicao) {
      if (!periodos || periodos.length === 0) {
        novosErros.periodos = "Adicione pelo menos um período.";
      } else {
        const periodosVistos = new Set();
        const periodosPorIndice = {};
        periodos.forEach((p, index) => {
          const itemErro = {};
          if (!p.periodo) {
            itemErro.periodo = "Selecione um período.";
          } else if (periodosVistos.has(p.periodo)) {
            itemErro.periodo = "Este período já foi adicionado.";
          }
          periodosVistos.add(p.periodo);
          const vagas = Number(p.vagasTotais);
          if (p.vagasTotais === "" || !Number.isInteger(vagas) || vagas < 0) {
            itemErro.vagasTotais =
              "Informe um número inteiro maior ou igual a zero.";
          }
          if (Object.keys(itemErro).length > 0) {
            periodosPorIndice[index] = itemErro;
          }
        });
        if (Object.keys(periodosPorIndice).length > 0) {
          novosErros.periodosPorIndice = periodosPorIndice;
        }
      }
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarCursoForm()) return;
    if (emEdicao) {
      onSalvar({ nome: nome.trim() });
    } else {
      onSalvar({
        nome: nome.trim(),
        periodos: periodos.map((periodo) => ({
          ...periodo,
          vagasTotais: Number(periodo.vagasTotais),
        })),
      });
    }
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={emEdicao ? "Editar curso" : "Adicionar curso"}
      largura="max-w-xl"
      conteudoRolavel={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {erro && <Alert type="error" message={erro} />}
        <Input
          label="Nome do curso"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Desenvolvimento de Sistemas"
          error={erros.nome}
          autoFocus
          required
        />

        {!emEdicao && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-text-primary">Períodos</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={adicionarPeriodo}
                leftIcon={<FiIcons.FiPlus />}
                disabled={periodos.length >= 5}
              >
                Adicionar período
              </Button>
            </div>

            {erros.periodos && (
              <p className="text-sm text-status-danger">{erros.periodos}</p>
            )}

            <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
              {periodos.map((item, index) => (
                <div
                  key={index}
                  className="rounded-card border border-border bg-surface-muted p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">
                      Período {index + 1}
                    </h4>
                    {periodos.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removerPeriodo(index)}
                        leftIcon={<FiIcons.FiTrash2 />}
                      >
                        Remover
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Select
                      label="Período"
                      placeholder="Selecione o período"
                      options={PERIODOS_CURSO}
                      value={item.periodo}
                      onChange={(e) =>
                        atualizarPeriodo(index, "periodo", e.target.value)
                      }
                      error={erros.periodosPorIndice?.[index]?.periodo}
                      required
                    />

                    <Input
                      label="Vagas totais"
                      type="number"
                      min="0"
                      step="5"
                      value={item.vagasTotais}
                      onChange={(e) =>
                        atualizarPeriodo(index, "vagasTotais", e.target.value)
                      }
                      error={erros.periodosPorIndice?.[index]?.vagasTotais}
                      required
                    />
                  </div>

                  <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={item.matriculaAtiva}
                      onChange={(e) =>
                        atualizarPeriodo(index, "matriculaAtiva", e.target.checked)
                      }
                    />
                    Matrícula disponível para este período
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="flex justify-end gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="secondary"
            onClick={onFechar}
            disabled={salvando}
          >
            Cancelar
          </Button>

          <Button type="submit" loading={salvando}>
            {emEdicao ? "Salvar alterações" : "Salvar curso"}
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default CursoModal;
