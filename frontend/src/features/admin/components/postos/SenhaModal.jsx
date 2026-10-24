import * as React from "react";
import Modal from "../../../../components/ui/Modal";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import { formatarSenha, formatarDataHora, formatarHora } from "../../../../utils/formatters";
import { transferirSenha, cancelarSenha } from "../../services/postosService";
import { alterarPrioridade } from "../../../postos/services/filaService";
import { POSTOS, CORES_STATUS, NOMES_DOCUMENTOS } from "../../constants/postos";

const SenhaModal = ({ aberto, senha, onFechar, onAtualizar }) => {
  const [carregando, setCarregando] = React.useState(false);
  const [confirmandoCancelamento, setConfirmandoCancelamento] =
    React.useState(false);
  React.useEffect(() => {
    setConfirmandoCancelamento(false);
  }, [aberto, senha?.id]);

  if (!aberto || !senha) return null;

  const podeTransferir = senha.status === "aguardando";
  const podeGerenciar = !["finalizada", "cancelada"].includes(senha.status);
  const postosDestino = POSTOS.filter((p) => p !== senha.posto);

  const executar = async (acao) => {
    setCarregando(true);
    try {
      await acao();
      onAtualizar?.();
      onFechar();
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={`Senha ${formatarSenha(senha.codigo)}`}
      largura="max-w-lg"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge
            variant={CORES_STATUS[senha.status]}
            size="md"
            className="capitalize"
          >
            {senha.status.replace("_", " ")}
          </Badge>
          <Badge variant={senha.prioritaria ? "warning" : "neutral"} size="md">
            {senha.prioritaria ? "Prioritária" : "Normal"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm border-y border-border py-3">
          {senha.aluno && (
            <div>
              <span className="text-xs text-text-secondary block">Aluno</span>
              <span className="font-semibold text-text-primary">
                {senha.aluno.nome}
              </span>
            </div>
          )}

          {senha.curso && (
            <div>
              <span className="text-xs text-text-secondary block">
                Curso / Período
              </span>
              <span className="font-medium text-text-primary flex flex-col">
                <p>{senha.curso.nome}</p>
                <p>{senha.curso.periodo}</p>
              </span>
            </div>
          )}

          {senha.posto && (
            <div>
              <span className="text-xs text-text-secondary block">Posto</span>
              <span className="font-medium text-text-primary capitalize">
                {senha.posto}
              </span>
            </div>
          )}

          {senha.guiche && (
            <div>
              <span className="text-xs text-text-secondary block">Guichê</span>
              <span className="font-medium text-text-primary">
                Guichê {senha.guiche}
              </span>
            </div>
          )}

          {senha.emitidaEm && (
            <div>
              <span className="text-xs text-text-secondary block">
                Senha emitida em
              </span>
              <span className="font-medium text-text-primary">
                {formatarDataHora(senha.emitidaEm)}
              </span>
            </div>
          )}

          {senha.iniciadoEm && (
            <div>
              <span className="text-xs text-text-secondary block">
                Atendimento iniciado às
              </span>
              <span className="font-medium text-text-primary">
                {formatarHora(senha.iniciadoEm)}
              </span>
            </div>
          )}

          {senha.registradaEm && (
            <div>
              <span className="text-xs text-text-secondary block">
                Registrada em
              </span>
              <span className="font-medium text-text-primary">
                {formatarDataHora(senha.registradaEm)}
              </span>
            </div>
          )}

          {senha.encerradaEm && (
            <div>
              <span className="text-xs text-text-secondary block">
                Senha encerrada em
              </span>
              <span className="font-medium text-text-primary">
                {formatarDataHora(senha.encerradaEm)}
              </span>
            </div>
          )}

          {senha.tempoTotal && (
            <div>
              <span className="text-xs text-text-secondary block">
                Tempo Total
              </span>
              <span className="font-medium text-text-primary">
                {senha.tempoTotal}
              </span>
            </div>
          )}
        </div>

        {senha.documentos?.length > 0 && (
          <div className="rounded-lg bg-surface-muted p-3 border border-border">
            <span className="text-xs font-semibold text-text-secondary block mb-1.5">
              Documentos pendentes:
            </span>
            <ul className="text-xs text-text-primary space-y-1">
              {senha.documentos.map((doc) => (
                <li key={doc} className="flex items-center gap-1.5">
                  <span className="text-status-warning">•</span>
                  <span>{NOMES_DOCUMENTOS[doc]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {podeTransferir && postosDestino.length > 0 && (
          <div>
            <span className="text-xs text-text-secondary block mb-2 font-medium">
              Transferir para outro posto:
            </span>
            <div className="flex gap-2">
              {postosDestino.map((posto) => (
                <Button
                  key={posto}
                  size="sm"
                  variant="outline"
                  className="capitalize"
                  onClick={() =>
                    executar(() => transferirSenha(senha.id, posto))
                  }
                  disabled={carregando}
                >
                  {posto}
                </Button>
              ))}
            </div>
          </div>
        )}

        {podeGerenciar && (
          <div className="flex justify-between items-center pt-3 border-t border-border">
            {confirmandoCancelamento ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-status-danger font-medium">
                  Confirmar cancelamento?
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => executar(() => cancelarSenha(senha.id))}
                  loading={carregando}
                >
                  Sim
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmandoCancelamento(false)}
                  disabled={carregando}
                >
                  Não
                </Button>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmandoCancelamento(true)}
                disabled={carregando}
              >
                Cancelar Senha
              </Button>
            )}

            <Button
              variant={senha.prioritaria ? "secondary" : "primary"}
              size="sm"
              onClick={() =>
                executar(() => alterarPrioridade(senha.id, !senha.prioritaria))
              }
              loading={carregando}
            >
              {senha.prioritaria ? "Remover prioridade" : "Tornar prioritária"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SenhaModal;
