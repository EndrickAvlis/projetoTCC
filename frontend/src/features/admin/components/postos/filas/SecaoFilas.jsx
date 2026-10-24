import * as React from "react";
import Button from "../../../../../components/ui/Button";
import CardRetratil from "../../../../../components/ui/CardRetratil";
import Badge from "../../../../../components/ui/Badge";
import { useFilas } from "../../../hooks/postos/useFilas";
import SenhaModal from "../SenhaModal";
import { formatarSenha, formatarHora } from "../../../../../utils/formatters";
import { NOMES_DOCUMENTOS } from "../../../constants/postos";

const DADOS_PADRAO = {
  totais: { aguardando: 0, emAtendimento: 0, prioritarias: 0 },
  emAtendimento: [],
  aguardando: [],
};

const CARDS_POSTOS = [
  {
    id: "triagem",
    nome: "Triagem",
    borda: "border-triagem-border",
    fundoHeader: "bg-triagem-bg",
  },
  {
    id: "apm",
    nome: "APM",
    borda: "border-apm-border",
    fundoHeader: "bg-apm-bg",
  },
  {
    id: "docs",
    nome: "Docs",
    borda: "border-docs-border",
    fundoHeader: "bg-docs-bg",
  },
];

const SecaoFilas = () => {
  const { postos, pendencias, recarregar } = useFilas();

  const [senhaSelecionada, setSenhaSelecionada] = React.useState(null);
  const [abertos, setAbertos] = React.useState({
    triagem: true,
    apm: true,
    docs: true,
    pendencias: false,
  });

  const todosAbertos = Object.values(abertos).every(Boolean);
  const todosFechados = Object.values(abertos).every((v) => !v);

  const alternar = (id) => {
    setAbertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandirTodos = () => {
    setAbertos({ triagem: true, apm: true, docs: true, pendencias: true });
  };

  const recolherTodos = () => {
    setAbertos({ triagem: false, apm: false, docs: false, pendencias: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 border-b border-border pb-4">
        <Button
          size="sm"
          variant={todosAbertos ? "primary" : "outline"}
          onClick={expandirTodos}
        >
          Expandir todos
        </Button>
        <Button
          size="sm"
          variant={todosFechados ? "primary" : "outline"}
          onClick={recolherTodos}
        >
          Recolher todos
        </Button>
      </div>

      <div className="space-y-4">
        {CARDS_POSTOS.map((posto) => {
          const dados = postos.find((p) => p.id === posto.id) || DADOS_PADRAO;
          const { totais, emAtendimento, aguardando } = dados;

          return (
            <CardRetratil
              key={posto.id}
              className={posto.borda}
              headerClassName={posto.fundoHeader}
              tituloClassName="w-44 shrink-0"
              aberto={abertos[posto.id]}
              onToggle={() => alternar(posto.id)}
              titulo={posto.nome}
              resumo={
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span className="w-24">
                    <strong className="text-text-primary text-sm font-bold tabular-nums">
                      {totais.aguardando}
                    </strong>{" "}
                    esperando
                  </span>
                  <span className="w-32">
                    <strong className="text-text-primary text-sm font-bold tabular-nums">
                      {totais.emAtendimento}
                    </strong>{" "}
                    em atendimento
                  </span>
                  <span className="w-28">
                    <strong className="text-status-warning text-sm font-bold tabular-nums">
                      {totais.prioritarias}
                    </strong>{" "}
                    prioritárias
                  </span>
                </div>
              }
            >
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
                    Em Atendimento ({totais.emAtendimento})
                  </h4>
                  {emAtendimento.length === 0 ? (
                    <p className="text-xs italic text-text-secondary py-4 text-center border border-dashed border-border rounded-lg">
                      Nenhum guichê em atendimento.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-37 overflow-y-auto pr-1">
                      {emAtendimento.map((senha) => (
                        <button
                          key={senha.id}
                          type="button"
                          onClick={() =>
                            setSenhaSelecionada({
                              ...senha,
                              posto: posto.id,
                              status: "em_atendimento",
                            })
                          }
                          className={`p-1 rounded-lg border text-center transition-colors cursor-pointer hover:bg-surface-muted flex flex-col items-center justify-center gap-0.5 h-17 ${
                            senha.prioritaria
                              ? "border-status-warning border-2 bg-status-warning-bg/15"
                              : "border-border bg-surface"
                          }`}
                        >
                          <span className="text-sm font-bold text-text-primary tabular-nums leading-tight">
                            {formatarSenha(senha.codigo)}
                          </span>
                          <span className="text-xs text-text-secondary leading-tight">
                            Guichê {senha.guiche}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-8">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
                    Aguardando ({totais.aguardando})
                  </h4>
                  {aguardando.length === 0 ? (
                    <p className="text-xs italic text-text-secondary py-4 text-center border border-dashed border-border rounded-lg">
                      Nenhuma senha aguardando.
                    </p>
                  ) : (
                    <div className="grid grid-cols-8 gap-2 max-h-37 overflow-y-auto pr-1">
                      {aguardando.map((senha) => (
                        <button
                          key={senha.id}
                          type="button"
                          onClick={() =>
                            setSenhaSelecionada({
                              ...senha,
                              posto: posto.id,
                              status: "aguardando",
                            })
                          }
                          className={`p-1.5 rounded-lg border text-center transition-colors cursor-pointer hover:bg-surface-muted hover:border-primary flex flex-col items-center justify-center gap-0.5 h-17 ${
                            senha.prioritaria
                              ? "border-status-warning border-2 bg-status-warning-bg/20"
                              : "border-border bg-surface"
                          }`}
                        >
                          <span className="text-sm font-bold text-text-primary tabular-nums leading-tight">
                            {formatarSenha(senha.codigo)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardRetratil>
          );
        })}

        <CardRetratil
          className="border-pendencias-border"
          headerClassName="bg-pendencias-bg"
          aberto={abertos.pendencias}
          onToggle={() => alternar("pendencias")}
          titulo="Pendências"
          badge={
            <Badge variant="warning" size="sm">
              {pendencias.length} pendentes
            </Badge>
          }
        >
          {pendencias.length === 0 ? (
            <p className="text-xs italic text-text-secondary py-2 text-center">
              Nenhuma pendência no momento.
            </p>
          ) : (
            <div className="grid grid-cols-9 gap-2 max-h-37 overflow-y-auto pr-1">
              {pendencias.map((senha) => {
                const docs = `Documentos pendentes:\n• ${senha.documentos
                  ?.map((doc) => NOMES_DOCUMENTOS[doc] || doc)
                  .join("\n• ")}`;

                return (
                  <button
                    key={senha.id}
                    type="button"
                    onClick={() =>
                      setSenhaSelecionada({
                        ...senha,
                        posto: "triagem",
                        status: "pendente",
                      })
                    }
                    title={docs}
                    className={`w-full p-1.5 rounded-lg border text-center transition-colors cursor-pointer hover:bg-surface-muted flex flex-col items-center justify-center gap-0.5 h-17 ${
                      senha.prioritaria
                        ? "border-status-warning border-2 bg-status-warning-bg/15"
                        : "border-border bg-surface"
                    }`}
                  >
                    <span className="text-sm font-bold text-text-primary leading-tight">
                      {formatarSenha(senha.codigo)}
                    </span>
                    <span className="text-xs text-text-secondary truncate">
                      {formatarHora(senha.registradaEm)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </CardRetratil>
      </div>

      <SenhaModal
        aberto={Boolean(senhaSelecionada)}
        senha={senhaSelecionada}
        onFechar={() => setSenhaSelecionada(null)}
        onAtualizar={recarregar}
      />
    </div>
  );
};

export default SecaoFilas;
