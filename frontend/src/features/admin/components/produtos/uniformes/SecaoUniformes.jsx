import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Alert from "../../../../../components/ui/Alert";
import Button from "../../../../../components/ui/Button";
import DataTable from "../../../../../components/ui/DataTable";
import TableMenuActions from "../../../../../components/ui/TableMenuActions";
import ConfirmarModal from "../../../../../components/ui/ConfirmarModal";

import UniformeModal from "./UniformeModal";
import MovimentarEstoqueModal from "./MovimentarEstoqueModal";
import UniformeSelector from "./UniformeSelector";

import { useUniformes } from "../../../hooks/useUniformes";
import * as produtoService from "../../../services/ProdutosService";
import { formatarMoeda } from "../../../../../utils/formatters";

const SecaoUniformes = () => {
  const [busca, setBusca] = React.useState("");
  const [arquivado, setArquivado] = React.useState(false);

  const [modalAberto, setModalAberto] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const [erroOperacao, setErroOperacao] = React.useState(null);
  const [salvandoAcao, setSalvandoAcao] = React.useState(false);

  const [uniformeParaEstoque, setUniformeParaEstoque] = React.useState(null);
  const [uniformeEmEdicao, setUniformeEmEdicao] = React.useState(null);
  const [uniformeParaArquivamento, setUniformeParaArquivamento] = React.useState(null);

  const { uniformes, total, carregando, erro, recarregar } = useUniformes({
    busca,
    arquivado,
  });

  // Adição e edição de uniforme
  const fecharModalUniforme = () => {
    setModalAberto(false);
    setUniformeEmEdicao(null);
    setErroOperacao(null);
  };

  const abrirModalUniforme = (uniformeParaEdicao = null) => {
    setErroOperacao(null);
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
          dadosUniforme
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

  const abrirMovimentacaoEstoque = (uniforme) => {
    setErroOperacao(null);
    setUniformeParaEstoque(uniforme);
  };

  const salvarMovimentacaoEstoque = async (movimentacao) => {
    if (!uniformeParaEstoque) return;

    setSalvandoAcao(true);
    setErroOperacao(null);

    try {
      await produtoService.alterarEstoqueUniforme(
        uniformeParaEstoque.id,
        movimentacao
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
        uniformeParaArquivamento.status !== "arquivado"
      );
      setUniformeParaArquivamento(null);
      await recarregar();
    } catch (error) {
      setErroOperacao(error.message);
    } finally {
      setSalvandoAcao(false);
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
      render: (uniforme) => {
        const isArquivado = uniforme.status === "arquivado";

        return (
          <TableMenuActions
            label={`Ações do uniforme ${uniforme.nome}`}
            itens={[
              {
                label: "Editar uniforme",
                icone: FiIcons.FiEdit2,
                onClick: () => abrirModalUniforme(uniforme),
              },
              {
                label: "Movimentar estoque",
                icone: FiIcons.FiPackage,
                onClick: () => abrirMovimentacaoEstoque(uniforme),
              },
              {
                label: isArquivado ? "Desarquivar" : "Arquivar",
                icone: isArquivado ? FiIcons.FiRotateCcw : FiIcons.FiArchive,
                onClick: () => {
                  setErroOperacao(null);
                  setUniformeParaArquivamento(uniforme);
                },
                variante: isArquivado ? "success" : "danger",
              },
            ]}
          />
        );
      },
    },
  ];

  return (
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

      <UniformeModal
        aberto={modalAberto}
        uniforme={uniformeEmEdicao}
        onFechar={fecharModalUniforme}
        onSalvar={handleSalvarUniforme}
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

      <ConfirmarModal
        aberto={Boolean(uniformeParaArquivamento)}
        onFechar={() => setUniformeParaArquivamento(null)}
        onConfirmar={confirmarArquivamento}
        titulo={
          uniformeParaArquivamento?.status === "arquivado"
            ? "Desarquivar uniforme"
            : "Arquivar uniforme"
        }
        mensagem={
          uniformeParaArquivamento?.status === "arquivado"
            ? `Deseja desarquivar o uniforme ${uniformeParaArquivamento?.nome}?`
            : `Deseja arquivar o uniforme ${uniformeParaArquivamento?.nome}? Ele deixará de aparecer entre os uniformes ativos.`
        }
        textoConfirmar={
          uniformeParaArquivamento?.status === "arquivado"
            ? "Desarquivar"
            : "Arquivar"
        }
        variante={
          uniformeParaArquivamento?.status === "arquivado"
            ? "success"
            : "danger"
        }
        salvando={salvandoAcao}
        erro={erroOperacao}
      />
    </section>
  );
};

export default SecaoUniformes;