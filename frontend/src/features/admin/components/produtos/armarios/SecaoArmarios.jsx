import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/Button";
import ArmarioModal from "./ArmarioModal";

import { useArmario } from "../../../hooks/useArmario";
import * as produtoService from "../../../services/ProdutosService";
import { formatarMoeda } from "../../../../../utils/formatters";

const SecaoArmarios = () => {
  const [modalArmarioAberto, setModalArmarioAberto] = React.useState(false);
  const [armarioEmEdicao, setArmarioEmEdicao] = React.useState(null);
  const [salvando, setSalvando] = React.useState(false);
  const [erroOperacao, setErroOperacao] = React.useState(null);

  const {
    armario,
    carregando: carregandoArmario,
    erro: erroArmario,
    recarregar: recarregarArmario,
  } = useArmario();

  const fecharModalArmario = () => {
    setModalArmarioAberto(false);
    setArmarioEmEdicao(null);
    setErroOperacao(null);
  };

  const abrirModalArmario = (armarioParaEdicao = null) => {
    setErroOperacao(null);
    setArmarioEmEdicao(armarioParaEdicao);
    setModalArmarioAberto(true);
  };

  const handleSalvarArmario = async (dados) => {
    setSalvando(true);
    setErroOperacao(null);

    try {
      if (armarioEmEdicao) {
        await produtoService.atualizarArmario(armarioEmEdicao.id, dados);
      } else {
        await produtoService.criarArmario(dados);
      }
      fecharModalArmario();
      await recarregarArmario();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const alterarDisponibilidadeArmario = async () => {
    if (!armario) return;

    setSalvando(true);
    setErroOperacao(null);

    try {
      await produtoService.alterarDisponibilidadeArmario(
        armario.id,
        armario.status !== "disponivel"
      );
      await recarregarArmario();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const estaDisponivel = armario?.status === "disponivel";

  return (
    <section
      id="painel-armarios"
      role="tabpanel"
      aria-labelledby="tab-armarios"
      className="space-y-4"
    >
      {erroOperacao && <Alert type="error" message={erroOperacao} />}

      {carregandoArmario ? (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-text-secondary">
          Carregando configuração do armário...
        </div>
      ) : erroArmario ? (
        <Alert type="error" message={erroArmario} />
      ) : armario ? (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <FiIcons.FiGrid size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Configuração do armário
                  </h2>

                  <p className="mt-1 text-sm text-text-secondary">
                    Defina o preço, a quantidade disponível e a visibilidade na APM.
                  </p>
                </div>
              </div>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                estaDisponivel
                  ? "bg-status-success-bg text-status-success"
                  : "bg-disabled-bg text-text-secondary"
              }`}
            >
              {estaDisponivel ? "Disponível na APM" : "Indisponível na APM"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm text-text-secondary">Preço</p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {formatarMoeda(Number(armario.preco))}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm text-text-secondary">Quantidade disponível</p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {armario.quantidade}
              </p>
            </div>
          </div>

          <footer className="mt-6 flex flex-col justify-end gap-3 border-t border-border pt-5 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              leftIcon={<FiIcons.FiEdit2 />}
              onClick={() => abrirModalArmario(armario)}
              disabled={salvando}
            >
              Editar configuração
            </Button>

            <Button
              type="button"
              variant={estaDisponivel ? "danger" : "success"}
              leftIcon={estaDisponivel ? <FiIcons.FiEyeOff /> : <FiIcons.FiEye />}
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
            leftIcon={<FiIcons.FiPlus />}
            className="mt-4"
            onClick={() => abrirModalArmario()}
          >
            Configurar armário
          </Button>
        </div>
      )}

      <ArmarioModal
        aberto={modalArmarioAberto}
        armario={armarioEmEdicao}
        onFechar={fecharModalArmario}
        onSalvar={handleSalvarArmario}
        salvando={salvando}
        erro={erroOperacao}
      />
    </section>
  );
};

export default SecaoArmarios;