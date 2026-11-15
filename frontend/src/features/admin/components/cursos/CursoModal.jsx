import * as React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import Toggle from "../../../../components/ui/Toggle";
import {
  PERIODOS_CURSO,
  VAGAS_MAXIMAS_PERIODO,
} from "../../../../constants/cursoOptions";
import {
  bloquearTeclasNaoInteiras,
  validarQuantidadeInteira,
} from "../../../../utils/formHelpers";

const PERIODOS_VALIDOS = new Set(PERIODOS_CURSO.map((p) => p.value));
let proximoIdPeriodo = 0;

const criarPeriodoInicial = (periodo = "") => ({
  chave: `periodo-${++proximoIdPeriodo}`,
  periodo,
  vagasTotais: "",
  matriculaAtiva: true,
  erros: {},
});

const construirPeriodosIniciais = (periodosSugeridos = []) => {
  const validos = [...new Set(periodosSugeridos)]
    .filter((p) => PERIODOS_VALIDOS.has(p))
    .slice(0, PERIODOS_CURSO.length);

  return validos.length > 0
    ? validos.map((periodo) => criarPeriodoInicial(periodo))
    : [criarPeriodoInicial()];
};

const CursoModalForm = ({
  curso = null,
  dadosIniciaisCurso = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  const emEdicao = Boolean(curso);

  const [nome, setNome] = React.useState(() =>
    curso ? curso.nome : (dadosIniciaisCurso?.nome ?? ""),
  );
  const [erroNome, setErroNome] = React.useState("");
  const [periodos, setPeriodos] = React.useState(() =>
    curso ? [] : construirPeriodosIniciais(dadosIniciaisCurso?.periodos),
  );

  const periodosUsados = new Set(
    periodos.map((item) => item.periodo).filter(Boolean),
  );

  const opcoesPeriodo = (periodoAtual) =>
    PERIODOS_CURSO.map((op) => ({
      ...op,
      disabled: periodosUsados.has(op.value) && op.value !== periodoAtual,
    }));

  const adicionarPeriodo = () => {
    if (periodos.length >= PERIODOS_CURSO.length) return;
    setPeriodos((atuais) => [...atuais, criarPeriodoInicial()]);
  };

  const removerPeriodo = (chave) => {
    setPeriodos((atuais) => atuais.filter((item) => item.chave !== chave));
  };

  const atualizarPeriodo = (chave, campo, valor) => {
    setPeriodos((atuais) =>
      atuais.map((item) =>
        item.chave === chave
          ? {
              ...item,
              [campo]: valor,
              erros: { ...item.erros, [campo]: "" },
            }
          : item,
      ),
    );
  };

  const validarCursoForm = () => {
    const mensagemNome = nome.trim() ? "" : "Informe o nome do curso.";
    setErroNome(mensagemNome);

    if (emEdicao) {
      return !mensagemNome;
    }

    let periodoInvalido = false;
    const periodosVistos = new Set();

    const periodosValidados = periodos.map((item) => {
      const itemErros = {};

      if (!item.periodo) {
        itemErros.periodo = "Selecione um período.";
      } else if (periodosVistos.has(item.periodo)) {
        itemErros.periodo = "Este período já foi adicionado.";
      }

      if (item.periodo) {
        periodosVistos.add(item.periodo);
      }

      const erroVagas = validarQuantidadeInteira(item.vagasTotais, {
        mensagemVazio: "Informe o total de vagas.",
        minimo: 1,
        mensagemMinimo: "Informe ao menos 1 vaga.",
        maximo: VAGAS_MAXIMAS_PERIODO,
        mensagemMaximo: "A quantidade máxima permitida é 9.999 vagas.",
      });

      if (erroVagas) {
        itemErros.vagasTotais = erroVagas;
      }

      if (itemErros.periodo || itemErros.vagasTotais) {
        periodoInvalido = true;
      }

      return { ...item, erros: itemErros };
    });

    setPeriodos(periodosValidados);
    return !mensagemNome && !periodoInvalido;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarCursoForm()) return;

    if (emEdicao) {
      onSalvar({ nome: nome.trim() });
      return;
    }

    onSalvar({
      nome: nome.trim(),
      periodos: periodos.map(({ periodo, vagasTotais, matriculaAtiva }) => ({
        periodo,
        vagasTotais: Number(vagasTotais),
        matriculaAtiva,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Input
        label="Nome do curso"
        maxLength={100}
        value={nome}
        onChange={(e) => {
          setNome(e.target.value);
          if (erroNome) setErroNome("");
        }}
        placeholder="Ex.: Desenvolvimento de Sistemas"
        error={erroNome}
        disabled={salvando}
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
              leftIcon={<FiPlus />}
              disabled={salvando || periodos.length >= PERIODOS_CURSO.length}
            >
              Adicionar período
            </Button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {periodos.map((item, index) => (
              <div
                key={item.chave}
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
                      onClick={() => removerPeriodo(item.chave)}
                      leftIcon={<FiTrash2 />}
                      disabled={salvando}
                    >
                      Remover
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Select
                    label="Período"
                    placeholder="Selecione o período"
                    options={opcoesPeriodo(item.periodo)}
                    value={item.periodo}
                    onChange={(e) =>
                      atualizarPeriodo(item.chave, "periodo", e.target.value)
                    }
                    error={item.erros.periodo}
                    disabled={salvando}
                    required
                  />

                  <Input
                    label="Vagas totais"
                    type="number"
                    min="1"
                    max={VAGAS_MAXIMAS_PERIODO}
                    step="1"
                    placeholder="Ex.: 40"
                    onKeyDown={bloquearTeclasNaoInteiras}
                    value={item.vagasTotais}
                    onChange={(e) =>
                      atualizarPeriodo(
                        item.chave,
                        "vagasTotais",
                        e.target.value,
                      )
                    }
                    error={item.erros.vagasTotais}
                    disabled={salvando}
                    required
                  />
                </div>

                <div className="mt-4">
                  <Toggle
                    size="sm"
                    checked={item.matriculaAtiva}
                    onChange={(valor) =>
                      atualizarPeriodo(item.chave, "matriculaAtiva", valor)
                    }
                    label="Matrícula aberta para este período"
                    disabled={salvando}
                  />
                </div>
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
  );
};

const CursoModal = ({
  aberto,
  curso = null,
  dadosIniciaisCurso = null,
  onFechar,
  onSalvar,
  salvando = false,
}) => {
  return (
    <Modal
      aberto={aberto}
      onFechar={() => !salvando && onFechar()}
      titulo={curso ? "Editar curso" : "Adicionar curso"}
      largura="max-w-xl"
    >
      {aberto && (
        <CursoModalForm
          key={curso ? `edit-${curso.id}` : `new-${dadosIniciaisCurso?.nome ?? ""}`}
          curso={curso}
          dadosIniciaisCurso={dadosIniciaisCurso}
          onFechar={onFechar}
          onSalvar={onSalvar}
          salvando={salvando}
        />
      )}
    </Modal>
  );
};

export default CursoModal;
