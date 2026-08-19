import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";

import AdicionarConfiguracaoArmarioModal from "../components/produtos/armarios/AdicionarConfiguracaoArmarioModal";
import ConfiguracaoArmario from "../components/produtos/armarios/ConfiguracaoArmario";
import EditarConfiguracaoArmarioModal from "../components/produtos/armarios/EditarConfiguracaoArmarioModal";

import AdicionarUniformeModal from "../components/produtos/uniformes/AdicionarUniformeModal";
import EditarUniformeModal from "../components/produtos/uniformes/EditarUniformeModal";
import MenuAcoesUniforme from "../components/produtos/uniformes/MenuAcoesUniforme";
import MovimentarEstoqueModal from "../components/produtos/uniformes/MovimentarEstoqueModal";
import ProdutosTipoSelector from "../components/produtos/uniformes/ProdutosTipoSelector";
import UniformeSelector from "../components/produtos/uniformes/UniformeSelector";
import ConfirmarArquivamentoUniformeModal from "../components/produtos/uniformes/ConfirmarArquivamentoUniformeModal";

import { useUniformes } from "../hooks/useUniformes";
import { useArmario } from "../hooks/useArmario";
import * as produtoService from "../services/ProdutosService";
import { formatarMoeda } from "../../../utils/formatters";

const ProdutosPage = () => {
  const [tipoSelecionado, setTipoSelecionado] = React.useState("uniformes");
  const [busca, setBusca] = React.useState("");
  const [arquivado, setArquivado] = React.useState(false);

  const [modalAberto, setModalAberto] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const [erroOperacao, setErroOperacao] = React.useState(null);
  const [salvandoAcao, setSalvandoAcao] = React.useState(false);
  const [uniformeComMenuAberto, setUniformeComMenuAberto] = React.useState(null);
  const [uniformeParaEstoque, setUniformeParaEstoque] = React.useState(null);
  const [uniformeEmEdicao, setUniformeEmEdicao] = React.useState(null);
  const [uniformeParaArquivamento, setUniformeParaArquivamento] = React.useState(null);
  const [modalArmarioAberto, setModalArmarioAberto] = React.useState(false);
  const [armarioEmEdicao, setArmarioEmEdicao] = React.useState(null);
  const [salvandoArmario, setSalvandoArmario] = React.useState(false);
  const [erroArmarioOperacao, setErroArmarioOperacao] = React.useState(null);

  const { uniformes, total, carregando, erro, recarregar } = useUniformes({ busca, arquivado });
  const {
    armario,
    carregando: carregandoArmario,
    erro: erroArmario,
    recarregar: recarregarArmario,
  } = useArmario();

  const fecharMenuAcoes = () => {
    setUniformeComMenuAberto(null);
  };

  const abrirModalCriacaoUniforme = () => {
    setErroOperacao(null);
    setModalAberto(true);
  };
  const handleSalvarUniforme = async (dadosUniforme) => {
    setSalvando(true);
    setErroOperacao(null);

    try {
      await produtoService.criarUniforme(dadosUniforme);

      setModalAberto(false);

      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const abrirMovimentacaoEstoque = (uniforme) => {
    setErroOperacao(null);
    fecharMenuAcoes();
    setUniformeParaEstoque(uniforme);
  };
  const salvarMovimentacaoEstoque = async (
    movimentacao,
  ) => {
    if (!uniformeParaEstoque) {
      return;
    }

    setSalvandoAcao(true);
    setErroOperacao(null);

    try {
      await produtoService.alterarEstoqueUniforme(
        uniformeParaEstoque.id,
        movimentacao,
      );

      setUniformeParaEstoque(null);

      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvandoAcao(false);
    }
  };

  const abrirEdicaoUniforme = (uniforme) => {
    setErroOperacao(null);
    fecharMenuAcoes();
    setUniformeEmEdicao(uniforme);
  };
  const salvarUniformeEditado = async (dadosUniforme) => {
    if (!uniformeEmEdicao) {
      return;
    }

    setSalvandoAcao(true);
    setErroOperacao(null);

    try {
      await produtoService.atualizarUniforme(
        uniformeEmEdicao.id,
        dadosUniforme,
      );

      setUniformeEmEdicao(null);

      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvandoAcao(false);
    }
  };

  const confirmarArquivamento = async () => {
    if (!uniformeParaArquivamento) {
      return;
    }

    setSalvandoAcao(true);
    setErroOperacao(null);

    try {
      await produtoService.alterarArquivamentoUniforme(
        uniformeParaArquivamento.id,
        uniformeParaArquivamento.status !== "arquivado",
      );

      setUniformeParaArquivamento(null);

      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvandoAcao(false);
    }
  }

  const abrirCriacaoArmario = () => {
    setErroArmarioOperacao(null);
    setModalArmarioAberto(true);
  };

  const salvarConfiguracaoInicialArmario = async (dadosArmario) => {
    setSalvandoArmario(true);
    setErroArmarioOperacao(null);

    try {
      await produtoService.criarConfiguracaoArmario(dadosArmario);
      setModalArmarioAberto(false);
      await recarregarArmario();
    } catch (error) {
      setErroArmarioOperacao(error.message);
    } finally {
      setSalvandoArmario(false);
    }
  };

  const abrirEdicaoArmario = () => {
    setErroArmarioOperacao(null);
    setArmarioEmEdicao(armario);
  };

  const salvarConfiguracaoArmario = async (dadosArmario) => {
    if (!armarioEmEdicao) {
      return;
    }

    setSalvandoArmario(true);
    setErroArmarioOperacao(null);

    try {
      await produtoService.atualizarConfiguracaoArmario(
        armarioEmEdicao.id,
        dadosArmario,
      );
      setArmarioEmEdicao(null);
      await recarregarArmario();
    } catch (error) {
      setErroArmarioOperacao(error.message);
    } finally {
      setSalvandoArmario(false);
    }
  };

  const alterarDisponibilidadeArmario = async () => {
    if (!armario) {
      return;
    }

    setSalvandoArmario(true);
    setErroArmarioOperacao(null);

    try {
      await produtoService.alterarDisponibilidadeArmario(
        armario.id,
        armario.status !== "disponivel",
      );
      await recarregarArmario();
    } catch (error) {
      setErroArmarioOperacao(error.message);
    } finally {
      setSalvandoArmario(false);
    }
  };

  const columnsUniforme = [
    //*nome
    {
      key: "nome",
      label: "Tamanho",
      render: (uniforme) => (
        <span className="font-semibold text-text-primary">
          {uniforme.nome}
        </span>
      ),
    },

    //*preço
    {
      key: "preco",
      label: "Preço",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (uniforme) => formatarMoeda(Number(uniforme.preco)),
    },

    //*quantidade
    {
      key: "quantidade",
      label: "Quantidade",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (uniforme) => (
        <span>
          {uniforme.quantidade} unidade
          {uniforme.quantidade === 1 ? "" : "s"}
        </span>
      ),
    },

    //*status
    {
      key: "status",
      label: "Situação",
      render: (uniforme) => {
        const isArquivado = uniforme.status === "arquivado";

        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isArquivado
              ? "bg-disabled-bg text-text-secondary"
              : "bg-status-success-bg text-status-success"
              }`}
          >
            {isArquivado ? "Arquivado" : "Ativo"}
          </span>
        );
      },
    },

    //*ações
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",

      render: (uniforme) => (
        <MenuAcoesUniforme
          uniforme={uniforme}
          aberto={uniformeComMenuAberto === uniforme.id}
          onAbrir={() =>
            setUniformeComMenuAberto(uniforme.id)
          }
          onFechar={fecharMenuAcoes}
          onMovimentarEstoque={abrirMovimentacaoEstoque}
          onEditar={abrirEdicaoUniforme}
          onAlterarArquivamento={(uniformeSelecionado) => {
            setErroOperacao(null);
            setUniformeParaArquivamento(uniformeSelecionado);
          }}
        />
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <ProdutosTipoSelector
        tipoSelecionado={tipoSelecionado}
        onSelecionar={setTipoSelecionado}
      />

      {tipoSelecionado === "uniformes" ? (
        <section
          id="painel-uniformes"
          role="tabpanel"
          aria-labelledby="tab-uniformes"
          className="space-y-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="mt-1 text-text-secondary">
              {total} uniforme{total === 1 ? "" : "s"}{" "}
              {arquivado ? "arquivado" : "ativo"}
              {total === 1 ? "" : "s"} encontrado
              {total === 1 ? "" : "s"}.
            </p>

            <Button
              leftIcon={<FiIcons.FiPlus />}
              className="w-full sm:w-auto"
              onClick={abrirModalCriacaoUniforme}
            >
              Adicionar uniforme
            </Button>
          </div>

          <UniformeSelector
            busca={busca}
            onAlterarBusca={setBusca}
            arquivado={arquivado}
            onAlterarArquivado={setArquivado}
          />

          {erro && <Alert type="error" message={erro} />}

          {carregando ? (
            <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-text-secondary">
              Carregando uniformes...
            </div>
          ) : (
            <DataTable
              columns={columnsUniforme}
              data={uniformes}
              // data={[
              //   {
              //     id: 1,
              //     nome: "M",
              //     preco: 45,
              //     quantidade: 10,
              //     tipo: "uniforme",
              //     status: "ativo",
              //   },
              // ]}
              getRowKey={(uniforme) => uniforme.id}
              emptyMessage={
                arquivado
                  ? "Nenhum uniforme arquivado encontrado."
                  : "Nenhum uniforme ativo encontrado."
              }
            />
          )}
        </section>
      ) : (
        <section
          id="painel-armarios"
          role="tabpanel"
          aria-labelledby="tab-armarios"
          className="space-y-4"
        >
          {erroArmarioOperacao && (
            <Alert type="error" message={erroArmarioOperacao} />
          )}

          {carregandoArmario ? (
            <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-text-secondary">
              Carregando configuração do armário...
            </div>
          ) : erroArmario ? (
            <Alert
              type="error"
              message={erroArmario}
            />
          ) : armario ? (
            <ConfiguracaoArmario
              armario={armario}
              onEditar={abrirEdicaoArmario}
              onAlterarDisponibilidade={alterarDisponibilidadeArmario}
              salvando={salvandoArmario}
            />
          ) : (
            <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center">
              <p className="text-text-secondary">
                A configuração do armário ainda não foi criada.
              </p>

              <Button
                leftIcon={<FiIcons.FiPlus />}
                className="mt-4"
                onClick={abrirCriacaoArmario}
              >
                Configurar armário
              </Button>
            </div>
          )}
        </section>
      )}

      <AdicionarUniformeModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSalvar={handleSalvarUniforme}
        salvando={salvando}
        erro={erroOperacao}
      />

      <MovimentarEstoqueModal
        uniforme={uniformeParaEstoque}
        onFechar={() =>
          setUniformeParaEstoque(null)
        }
        onSalvar={salvarMovimentacaoEstoque}
        salvando={salvandoAcao}
        erro={erroOperacao}
      />

      <EditarUniformeModal
        uniforme={uniformeEmEdicao}
        onFechar={() => setUniformeEmEdicao(null)}
        onSalvar={salvarUniformeEditado}
        salvando={salvandoAcao}
        erro={erroOperacao}
      />

      <ConfirmarArquivamentoUniformeModal
        uniforme={uniformeParaArquivamento}
        onFechar={() => setUniformeParaArquivamento(null)}
        onConfirmar={confirmarArquivamento}
        salvando={salvandoAcao}
        erro={erroOperacao}
      />

      <AdicionarConfiguracaoArmarioModal
        key={modalArmarioAberto ? "novo-armario" : "sem-novo-armario"}
        aberto={modalArmarioAberto}
        onFechar={() => setModalArmarioAberto(false)}
        onSalvar={salvarConfiguracaoInicialArmario}
        salvando={salvandoArmario}
        erro={erroArmarioOperacao}
      />

      <EditarConfiguracaoArmarioModal
        key={armarioEmEdicao?.id ?? "sem-armario"}
        armario={armarioEmEdicao}
        onFechar={() => setArmarioEmEdicao(null)}
        onSalvar={salvarConfiguracaoArmario}
        salvando={salvandoArmario}
        erro={erroArmarioOperacao}
      />

    </section>
  );
};

export default ProdutosPage;
