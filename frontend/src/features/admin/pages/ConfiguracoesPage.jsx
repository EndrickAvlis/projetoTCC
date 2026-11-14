import * as React from "react";
import {
  FiBox,
  FiRefreshCw,
  FiRotateCcw,
  FiPrinter,
  FiExternalLink,
  FiTv,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import Button from "../../../components/ui/Button";
import ConfirmarModal from "../../../components/ui/ConfirmarModal";
import Toggle from "../../../components/ui/Toggle";

import { useArmario } from "../hooks/useArmario";
import * as produtoService from "../services/produtoService";
import * as configuracoesService from "../services/configuracoesService";
import { formatarSenha } from "../../../utils/formatters";
import { useAuth } from "../../../context/authContext";
import { useToast } from "../../../context/toastContext";

const CLASSE_BOTAO_LINK =
  "inline-flex w-full items-center justify-center gap-2 rounded-btn border-2 bg-surface px-3 py-2 text-xs font-bold tracking-wider transition-colors";

const BOTAO_PRIMARY =
  "border-primary text-primary hover:bg-primary hover:text-text-inverse";

const PAINEIS_CHAMADA = [
  {
    id: "principal",
    nome: "PRINCIPAL",
    rota: "/painel",
    senhaExemplo: "A001",
    fundo: "bg-primary",
    bordaInterna: "border-admin-sidebar-divider",
    area: "bg-admin-sidebar-hover/40",
    barra: "bg-focus-ring",
    botao: BOTAO_PRIMARY,
  },
  {
    id: "triagem",
    nome: "TRIAGEM",
    rota: "/painel/triagem",
    senhaExemplo: "A001",
    fundo: "bg-triagem-dark",
    bordaInterna: "border-triagem-border/30",
    area: "bg-triagem/20",
    barra: "bg-triagem-border",
    botao:
      "border-triagem text-triagem-text hover:bg-triagem hover:text-text-inverse",
  },
  {
    id: "apm",
    nome: "APM",
    rota: "/painel/apm",
    senhaExemplo: "A002",
    fundo: "bg-apm-dark",
    bordaInterna: "border-apm-border/30",
    area: "bg-apm/20",
    barra: "bg-apm-border",
    botao: "border-apm text-apm-text hover:bg-apm hover:text-text-inverse",
  },
  {
    id: "docs",
    nome: "DOCS",
    rota: "/painel/docs",
    senhaExemplo: "A003",
    fundo: "bg-docs-dark",
    bordaInterna: "border-docs-border/30",
    area: "bg-docs/20",
    barra: "bg-docs-border",
    botao: "border-docs text-docs-text hover:bg-docs hover:text-text-inverse",
  },
];

const ConfiguracoesPage = () => {
  const toast = useToast();
  const { usuario } = useAuth();
  const ehAdmin = usuario?.tipo === "admin";
  const {
    armario,
    carregando: carregandoArmario,
    recarregar: recarregarArmario,
  } = useArmario();
  const [salvandoArmario, setSalvandoArmario] = React.useState(false);

  const [modalResetAberto, setModalResetAberto] = React.useState(false);
  const [reiniciando, setReiniciando] = React.useState(false);

  const [ultimoNumero, setUltimoNumero] = React.useState(null);
  const [carregandoUltimaSenha, setCarregandoUltimaSenha] =
    React.useState(true);

  const carregarUltimaSenha = React.useCallback(async () => {
    setCarregandoUltimaSenha(true);
    try {
      const res = await configuracoesService.buscarUltimaSenha();
      setUltimoNumero(res.ultimoNumero ?? 0);
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setCarregandoUltimaSenha(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (ehAdmin) carregarUltimaSenha();
  }, [carregarUltimaSenha, ehAdmin]);

  const armarioDisponivel = Boolean(armario?.status);

  const handleToggleArmario = async () => {
    if (!armario || salvandoArmario) return;

    setSalvandoArmario(true);
    try {
      await produtoService.atualizarProduto(armario.id, {
        status: !armarioDisponivel,
      });
      await recarregarArmario();
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvandoArmario(false);
    }
  };

  const handleReiniciarSequencia = async () => {
    setReiniciando(true);
    try {
      await configuracoesService.reiniciarSequenciaSenhas();
      setModalResetAberto(false);
      setUltimoNumero(0);
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setReiniciando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-primary">
                <FiBox size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Locação de Armários
                </h2>
                <p className="text-xs text-text-secondary">
                  Disponibilidade na APM
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-text-secondary">
              Define se o guichê da APM pode oferecer armários para locação aos
              novos alunos durante o atendimento.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-medium text-text-primary">
              {armarioDisponivel ? "Locação liberada" : "Locação pausada"}
            </span>
            <Toggle
              checked={armarioDisponivel}
              onChange={handleToggleArmario}
              disabled={carregandoArmario || salvandoArmario || !armario}
            />
          </div>
        </div>

        {ehAdmin && (
          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-status-danger">
                  <FiRefreshCw size={20} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    Sequência de Senhas
                  </h2>
                  <p className="text-xs text-text-secondary">Controle diário</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-text-secondary">
                Cancela as senhas de hoje que não foram finalizadas e zera o
                contador diário de volta para 1.
              </p>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface-muted px-4 py-3">
                <span className="text-xs font-medium text-text-secondary">
                  Última senha emitida hoje
                </span>
                <span className="text-base font-bold text-text-primary">
                  {carregandoUltimaSenha
                    ? "Carregando..."
                    : formatarSenha(ultimoNumero) || "Nenhuma"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end border-t border-border pt-4">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setModalResetAberto(true)}
                leftIcon={<FiRotateCcw size={16} />}
              >
                Reiniciar Senhas
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-primary">
                <FiPrinter size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Totem de Senhas
                </h2>
                <p className="text-xs text-text-secondary">Autoatendimento</p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-xs py-3"
            >
              <div className="flex flex-col items-center gap-2 px-3 py-3">
                <div className="flex h-7 w-28 items-center justify-center rounded-md bg-primary text-[10px] font-bold tracking-wider text-text-inverse">
                  EMITIR SENHA
                </div>
              </div>

              <div className="flex flex-col items-center border-t border-border bg-surface-muted px-3 py-2.5">
                <div className="flex w-24 flex-col items-center rounded-md border-2 border-primary bg-surface px-2 py-1">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-primary">
                    Senha atual
                  </span>
                  <span className="text-sm font-black leading-tight text-text-primary">
                    A001
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <Link
              to="/emitir-senha"
              target="_blank"
              rel="noopener noreferrer"
              className={`${CLASSE_BOTAO_LINK} ${BOTAO_PRIMARY}`}
            >
              ABRIR TOTEM
              <FiExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-primary">
            <FiTv size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Painéis de Chamada
            </h2>
            <p className="text-xs text-text-secondary">
              Exibição em TVs e monitores por posto
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAINEIS_CHAMADA.map((painel) => (
            <div key={painel.id} className="flex flex-col gap-3">
              <div
                aria-hidden="true"
                className={`overflow-hidden rounded-lg border ${painel.bordaInterna} ${painel.fundo} shadow-xs`}
              >
                <div
                  className={`flex items-center justify-between border-b ${painel.bordaInterna} px-3 py-2`}
                >
                  <span className="h-2 w-12 rounded-full bg-white/30" />
                  <span className="h-2 w-7 rounded-full bg-white/20" />
                </div>

                <div className="flex h-36 gap-2.5 p-2.5">
                  <div
                    className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-md border ${painel.bordaInterna} ${painel.area}`}
                  >
                    <span
                      className={`h-2 w-10 rounded-full ${painel.barra} opacity-80`}
                    />
                    <span className="text-2xl font-black tracking-tight text-text-inverse">
                      {painel.senhaExemplo}
                    </span>
                    <div className="flex gap-2">
                      <span className="h-3.5 w-8 rounded-xs bg-white/15" />
                      <span className="h-3.5 w-8 rounded-xs bg-white/25" />
                    </div>
                  </div>

                  <div
                    className={`flex w-1/3 flex-col gap-2 rounded-md border ${painel.bordaInterna} ${painel.area} p-2`}
                  >
                    <span className="h-1.5 w-full rounded-full bg-white/20" />
                    <span className="h-7 w-full rounded-xs border border-white/10 bg-white/10" />
                    <span className="h-7 w-full rounded-xs border border-white/10 bg-white/10" />
                  </div>
                </div>
              </div>

              <Link
                to={painel.rota}
                target="_blank"
                rel="noopener noreferrer"
                className={`${CLASSE_BOTAO_LINK} ${painel.botao}`}
              >
                {painel.nome}
                <FiExternalLink size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <ConfirmarModal
        aberto={modalResetAberto}
        onFechar={() => setModalResetAberto(false)}
        onConfirmar={handleReiniciarSequencia}
        titulo="Reiniciar sequência diária de senhas?"
        textoConfirmar="Sim, reiniciar para 001"
        textoCancelar="Cancelar"
        variante="danger"
        salvando={reiniciando}
      >
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            Esta ação irá{" "}
            <strong className="font-semibold text-status-danger">
              cancelar todas as senhas não finalizadas emitidas hoje
            </strong>{" "}
            e reiniciar o contador diário.
          </p>
          <p>
            A próxima senha gerada no totem iniciará novamente pelo número{" "}
            <strong className="font-semibold text-text-primary">001</strong>.
          </p>
          <p className="text-xs text-text-disabled">
            O histórico de atendimentos anteriores permanece preservado no banco
            para auditoria.
          </p>
        </div>
      </ConfirmarModal>
    </div>
  );
};

export default ConfiguracoesPage;
