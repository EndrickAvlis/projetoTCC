import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";

import SecaoArmarios from "../components/produtos/armarios/SecaoArmarios";
import ArmarioModal from "../components/produtos/armarios/ArmarioModal";
import UniformeModal from "../components/produtos/uniformes/UniformeModal";

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
  const [uniformeComMenuAberto, setUniformeComMenuAberto] =
    React.useState(null);
  const [uniformeParaEstoque, setUniformeParaEstoque] = React.useState(null);
  const [uniformeEmEdicao, setUniformeEmEdicao] = React.useState(null);
  const [uniformeParaArquivamento, setUniformeParaArquivamento] =
    React.useState(null);

  const [modalArmarioAberto, setModalArmarioAberto] = React.useState(false);
  const [armarioEmEdicao, setArmarioEmEdicao] = React.useState(null);

  const { uniformes, total, carregando, erro, recarregar } = useUniformes({
    busca,
    arquivado,
  });
  const {
    armario,
    carregando: carregandoArmario,
    erro: erroArmario,
    recarregar: recarregarArmario,
  } = useArmario();

  // Adição e edição de armário
  const fecharModalArmario = () => {
    setModalArmarioAberto(false);
    setArmarioEmEdicao(null);
    setErroOperacao(null);
  };

  const abrirModalArmario = (armario = null) => {
    setErroOperacao(null);
    setArmarioEmEdicao(armario);
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

  // Adição e edição de uniforme
  const fecharModalUniforme = () => {
    setModalAberto(false);
    setUniformeEmEdicao(null);
    setErroOperacao(null);
  };

  const abrirModalUniforme = (uniformeParaEdicao = null) => {
    setErroOperacao(null);
    fecharMenuAcoes();
    setUniformeEmEdicao(uniformeParaEdicao);
    setModalAberto(true);
  };

  const handleSalvarUniforme = async (dadosUniforme) => {
    setSalvando(true);
    setErroOperacao(null);
    try {
      if (uniformeEmEdicao) {
        await produtoService.atualizarUniforme(
          uniformeEmEdicao.id,
          dadosUniforme,
        );
      } else {
        await produtoService.criarUniforme(dadosUniforme);
      }
      fecharModalUniforme();
      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const fecharMenuAcoes = () => {
    setUniformeComMenuAberto(null);
  };

  const abrirMovimentacaoEstoque = (uniforme) => {
    setErroOperacao(null);
    fecharMenuAcoes();
    setUniformeParaEstoque(uniforme);
  };

  const salvarMovimentacaoEstoque = async (movimentacao) => {
    if (!uniformeParaEstoque) return;

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

  const confirmarArquivamento = async () => {
    if (!uniformeParaArquivamento) return;

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
  };

  const alterarDisponibilidadeArmario = async () => {
    if (!armario) return;

    setSalvando(true);
    setErroOperacao(null);

    try {
      await produtoService.alterarDisponibilidadeArmario(
        armario.id,
        armario.status !== "disponivel",
      );
      await recarregarArmario();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const columnsUniforme = [
    {
      key: "nome",
      label: "Tamanho",
      render: (uniforme) => (
        <span className="font-semibold text-text-primary">{uniforme.nome}</span>
      ),
    },
    {
      key: "preco",
      label: "Preço",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (uniforme) => formatarMoeda(Number(uniforme.preco)),
    },
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
    {
      key: "status",
      label: "Situação",
      render: (uniforme) => {
        const isArquivado = uniforme.status === "arquivado";
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              isArquivado
                ? "bg-disabled-bg text-text-secondary"
                : "bg-status-success-bg text-status-success"
            }`}
          >
            {isArquivado ? "Arquivado" : "Ativo"}
          </span>
        );
      },
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (uniforme) => (
        <MenuAcoesUniforme
          uniforme={uniforme}
          aberto={uniformeComMenuAberto === uniforme.id}
          onAbrir={() => setUniformeComMenuAberto(uniforme.id)}
          onFechar={fecharMenuAcoes}
          onMovimentarEstoque={abrirMovimentacaoEstoque}
          onEditar={abrirModalUniforme}
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
        onSelecionar={(tipo) => {
          setErroOperacao(null);
          setTipoSelecionado(tipo);
        }}
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
              onClick={() => abrirModalUniforme()}
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
          {erroOperacao && <Alert type="error" message={erroOperacao} />}

          {carregandoArmario ? (
            <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-text-secondary">
              Carregando configuração do armário...
            </div>
          ) : erroArmario ? (
            <Alert type="error" message={erroArmario} />
          ) : armario ? (
            <SecaoArmarios
              armario={armario}
              onEditar={() => abrirModalArmario(armario)}
              onAlterarDisponibilidade={alterarDisponibilidadeArmario}
              salvando={salvando}
            />
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
        </section>
      )}

      <UniformeModal
        aberto={modalAberto}
        uniforme={uniformeEmEdicao}
        onFechar={fecharModalUniforme}
        onSalvar={handleSalvarUniforme}
        salvando={salvando}
        erro={erroOperacao}
      />

      <ArmarioModal
        aberto={modalArmarioAberto}
        armario={armarioEmEdicao}
        onFechar={fecharModalArmario}
        onSalvar={handleSalvarArmario}
        salvando={salvando}
        erro={erroOperacao}
      />

      <MovimentarEstoqueModal
        key={
          uniformeParaEstoque
            ? `estoque-${uniformeParaEstoque.id}`
            : "sem-uniforme-estoque"
        }
        uniforme={uniformeParaEstoque}
        onFechar={() => setUniformeParaEstoque(null)}
        onSalvar={salvarMovimentacaoEstoque}
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
    </section>
  );
};

export default ProdutosPage;
