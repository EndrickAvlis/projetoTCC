import * as React from "react";
import { FiEdit2, FiEyeOff, FiEye, FiPlus } from "react-icons/fi";

import Alert from "../../../../../components/ui/Alert";
import Badge from "../../../../../components/ui/Badge";
import Button from "../../../../../components/ui/Button";
import ArmarioModal from "./ArmarioModal";

import { useArmario } from "../../../hooks/useArmario";
import * as produtoService from "../../../services/produtoService";
import { formatarMoeda } from "../../../../../utils/formatters";
import { useToast } from "../../../../../context/toastContext";

const SecaoArmarios = () => {
  const toast = useToast();

  const [modalAtivo, setModalAtivo] = React.useState(null);
  const [salvando, setSalvando] = React.useState(false);

  const {
    armario,
    carregando: carregandoArmario,
    erro: erroArmario,
    recarregar: recarregarArmario,
  } = useArmario();

  const handleSalvarArmario = async (dados) => {
    setSalvando(true);

    try {
      if (armario) {
        await produtoService.atualizarProduto(armario.id, dados);
      } else {
        await produtoService.criarProduto({
          ...dados,
          tipo: "armario",
        });
      }
      setModalAtivo(null);
      toast.sucesso("Configuração do armário salva com sucesso.");
      await recarregarArmario({ silencioso: true });
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const alterarDisponibilidadeArmario = async () => {
    if (!armario) return;

    const proximoStatus = !armario.status;
    setSalvando(true);

    try {
      await produtoService.atualizarProduto(armario.id, {
        status: proximoStatus,
      });
      toast.sucesso(
        proximoStatus
          ? "Armário disponibilizado na APM."
          : "Armário ocultado na APM.",
      );
      await recarregarArmario({ silencioso: true });
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const estaDisponivel = Boolean(armario?.status);
  const armarioEsgotado = Boolean(armario && armario.quantidade === 0);

  return (
    <section
      id="painel-armarios"
      role="tabpanel"
      aria-labelledby="tab-armarios"
      className="space-y-4"
    >
      {carregandoArmario ? (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-text-secondary">
          Carregando configuração do armário...
        </div>
      ) : erroArmario ? (
        <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
          <Alert type="error" message={erroArmario} />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => recarregarArmario()}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : armario ? (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Configuração do armário
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Defina o preço, a quantidade disponível e a visibilidade na APM.
              </p>
            </div>

            <Badge
              variant={estaDisponivel ? "success" : "neutral"}
              size="md"
              className="w-fit"
            >
              {estaDisponivel ? "Disponível na APM" : "Indisponível na APM"}
            </Badge>
          </div>

          {estaDisponivel && armarioEsgotado && (
            <div className="mt-4">
              <Alert
                type="warning"
                message="Os armários estão esgotados. Enquanto a quantidade disponível for 0, a locação não será exibida na APM."
              />
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm text-text-secondary">Preço</p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {formatarMoeda(Number(armario.preco))}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm text-text-secondary">
                Quantidade disponível
              </p>
              <p
                className={`mt-1 text-xl font-semibold ${
                  armarioEsgotado ? "text-status-danger" : "text-text-primary"
                }`}
              >
                {armario.quantidade}
              </p>
            </div>
          </div>

          <footer className="mt-6 flex flex-col justify-end gap-3 border-t border-border pt-5 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={() => setModalAtivo("edicao")}
              disabled={salvando}
            >
              Editar configuração
            </Button>

            <Button
              type="button"
              variant={estaDisponivel ? "danger" : "success"}
              leftIcon={estaDisponivel ? <FiEyeOff /> : <FiEye />}
              onClick={alterarDisponibilidadeArmario}
              loading={salvando}
            >
              {estaDisponivel ? "Ocultar na APM" : "Disponibilizar na APM"}
            </Button>
          </footer>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center">
          <p className="text-text-secondary">
            A configuração do armário ainda não foi criada.
          </p>

          <Button
            leftIcon={<FiPlus />}
            className="mt-4"
            onClick={() => setModalAtivo("edicao")}
          >
            Configurar armário
          </Button>
        </div>
      )}

      <ArmarioModal
        aberto={modalAtivo === "edicao"}
        armario={armario}
        onFechar={() => setModalAtivo(null)}
        onSalvar={handleSalvarArmario}
        salvando={salvando}
      />
    </section>
  );
};

export default SecaoArmarios;
