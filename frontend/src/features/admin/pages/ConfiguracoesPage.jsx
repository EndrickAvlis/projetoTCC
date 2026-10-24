import * as React from "react";
import * as FiIcons from "react-icons/fi";
import { Link } from "react-router-dom";

import Button from "../../../components/ui/Button";
import ConfirmarModal from "../../../components/ui/ConfirmarModal";
import Toggle from "../../../components/ui/Toggle";

import { useArmario } from "../hooks/useArmario";
import * as produtoService from "../services/produtoService";
import * as configuracoesService from "../services/configuracoesService";
import { formatarSenha } from "../../../utils/formatters";

const ConfiguracoesPage = () => {
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
    } catch {
    } finally {
      setCarregandoUltimaSenha(false);
    }
  }, []);

  React.useEffect(() => {
    carregarUltimaSenha();
  }, [carregarUltimaSenha]);

  const armarioDisponivel = Boolean(armario?.status);

  const handleToggleArmario = async () => {
    if (!armario || salvandoArmario) return;

    setSalvandoArmario(true);
    try {
      await produtoService.atualizarProduto(armario.id, {
        status: !armarioDisponivel,
      });
      await recarregarArmario();
    } catch {
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
    } catch {
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
                <FiIcons.FiBox size={20} />
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

        <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-status-danger">
                <FiIcons.FiRefreshCw size={20} />
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
              leftIcon={<FiIcons.FiRotateCcw size={16} />}
            >
              Reiniciar Senhas
            </Button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-primary">
                <FiIcons.FiPrinter size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Totem de Senhas
                </h2>
                <p className="text-xs text-text-secondary">Autoatendimento</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-text-secondary">
              Acesse a tela de emissão de senhas configurada para totens,
              tablets ou guichês de entrada.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end border-t border-border pt-4">
            <Link
              to="/emitir-senha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button
                variant="outline"
                size="sm"
                rightIcon={<FiIcons.FiExternalLink size={16} />}
              >
                Abrir Totem
              </Button>
            </Link>
          </div>
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
