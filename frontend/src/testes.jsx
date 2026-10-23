import * as React from "react";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import GraficoFinalizadasHora from "./features/admin/components/postos/atendimento/GraficoFinalizadasHora";
import CursosAtivos from "./features/admin/components/postos/atendimento/CursosAtivos";
import SenhaPendente from "./features/admin/components/postos/filas/SenhaPendente";
import SenhaModal from "./features/admin/components/postos/SenhaModal";

const MOCK_FINALIZADAS_HORA = [
  { hora: "07h", quantidade: 2 },
  { hora: "08h", quantidade: 5 },
  { hora: "09h", quantidade: 12 },
  { hora: "10h", quantidade: 18 },
  { hora: "11h", quantidade: 14 },
  { hora: "12h", quantidade: 16 },
  { hora: "13h", quantidade: 22 },
  { hora: "14h", quantidade: 11 },
  { hora: "15h", quantidade: 8 },
  { hora: "16h", quantidade: 4 },
  { hora: "17h", quantidade: 2 },
  { hora: "18h", quantidade: 0 },
];

const MOCK_CURSOS_ATIVOS = [
  {
    id: 1,
    nome: "Desenvolvimento de Sistemas",
    periodos: ["manha", "tarde", "noite"],
    candidatosPeriodo: 29,
  },
  {
    id: 2,
    nome: "Administração",
    periodos: ["manha", "noite"],
    candidatosPeriodo: 27,
  },
  {
    id: 3,
    nome: "Enfermagem",
    periodos: ["integral"],
    candidatosPeriodo: 21,
  },
];

const MOCK_SENHA_PENDENTE_1 = {
  id: 12,
  codigo: 12,
  prioritaria: false,
  status: "pendente",
  posto: "triagem",
  registradaEm: "2026-10-15T14:40:00.000Z",
  emitidaEm: "2026-10-15T14:20:00.000Z",
  quantidadeDocumentos: 2,
  documentos: ["foto_3x4", "historico_ensino_fundamental"],
  aluno: { id: 4, nome: "Alice Mendes" },
  curso: { id: 3, nome: "Enfermagem", periodo: "integral" },
};

const MOCK_SENHA_PENDENTE_2 = {
  id: 15,
  codigo: 15,
  prioritaria: true,
  status: "pendente",
  posto: "triagem",
  registradaEm: "2026-10-15T15:10:00.000Z",
  emitidaEm: "2026-10-15T14:55:00.000Z",
  quantidadeDocumentos: 1,
  documentos: ["comprovante_residencia"],
  aluno: { id: 8, nome: "Lucas Rodrigues" },
  curso: { id: 1, nome: "Desenvolvimento de Sistemas", periodo: "noite" },
};

const MOCK_SENHA_EM_ATENDIMENTO = {
  id: 38,
  codigo: 38,
  prioritaria: true,
  status: "em_atendimento",
  posto: "triagem",
  guiche: 1,
  iniciadoEm: "2026-10-15T15:15:00.000Z",
  emitidaEm: "2026-10-15T14:50:00.000Z",
  aluno: { id: 12, nome: "Gabriel Moraes" },
  curso: { id: 1, nome: "Desenvolvimento de Sistemas", periodo: "tarde" },
  documentos: ["foto_3x4", "rg_cin"],
};

const Testes = () => {
  const [senhaSelecionada, setSenhaSelecionada] = React.useState(null);

  return (
    <div className="min-h-screen bg-page p-6 md:p-10 flex flex-col gap-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">
          Protótipos dos Postos
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Demonstração com dados dos componentes criados para Filas e Atendimento
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Cards de Indicadores (KPIs)
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <Card bordaLateral="success" className="w-full">
            <span className="text-xs font-semibold text-text-secondary">
              Senhas finalizadas
            </span>
            <div className="text-3xl font-bold text-text-primary mt-2 tabular-nums">
              85
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Concluíram todo o fluxo
            </p>
          </Card>

          <Card bordaLateral="danger" className="w-full">
            <span className="text-xs font-semibold text-text-secondary">
              Senhas canceladas
            </span>
            <div className="text-3xl font-bold text-text-primary mt-2 tabular-nums">
              5
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Encerradas pelo administrador
            </p>
          </Card>

          <Card bordaLateral="primary" className="w-full">
            <span className="text-xs font-semibold text-text-secondary">
              Senhas emitidas
            </span>
            <div className="text-3xl font-bold text-text-primary mt-2 tabular-nums">
              112
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Total emitidas
            </p>
          </Card>

          <Card bordaLateral="info" className="w-full">
            <span className="text-xs font-semibold text-text-secondary">
              Tempo médio de atendimento
            </span>
            <div className="text-3xl font-bold text-text-primary mt-2 tabular-nums">
              14 min
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Média por atendimento
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Gráfico de Horários
        </h2>
        <GraficoFinalizadasHora
          dados={MOCK_FINALIZADAS_HORA}
          periodoRotulo="Hoje"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Card Retrátil de Cursos Ativos
        </h2>
        <CursosAtivos cursos={MOCK_CURSOS_ATIVOS} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Senhas Pendentes e Modal de Detalhes
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSenhaSelecionada(MOCK_SENHA_EM_ATENDIMENTO)}
          >
            Abrir Modal (Em Atendimento)
          </Button>
        </div>

        <div className="space-y-2">
          <SenhaPendente
            senha={MOCK_SENHA_PENDENTE_1}
            onSelecionar={setSenhaSelecionada}
          />
          <SenhaPendente
            senha={MOCK_SENHA_PENDENTE_2}
            onSelecionar={setSenhaSelecionada}
          />
        </div>
      </section>

      <SenhaModal
        aberto={Boolean(senhaSelecionada)}
        senha={senhaSelecionada}
        onFechar={() => setSenhaSelecionada(null)}
        onAtualizar={() => {}}
      />
    </div>
  );
};

export default Testes;
