import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Badge from "../../../../../components/ui/Badge";
import Button from "../../../../../components/ui/Button";
import DataTable from "../../../../../components/ui/DataTable";
import TableMenuActions from "../../../../../components/ui/TableMenuActions";
import ConfirmarModal from "../../../../../components/ui/ConfirmarModal";

import UniformeModal from "./UniformeModal";
import MovimentarEstoqueModal from "./MovimentarEstoqueModal";
import UniformeSelector from "./UniformeSelector";

import { useUniformes } from "../../../hooks/useUniformes";
import * as produtoService from "../../../services/produtoService";
import { formatarMoeda } from "../../../../../utils/formatters";
import { useAuth } from "../../../../../context/authContext";

const SecaoUniformes = () => {
  const { usuario: usuarioLogado } = useAuth();
  const ehAdmin = usuarioLogado?.tipo === "admin";

  const [busca, setBusca] = React.useState("");
  const [arquivado, setArquivado] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const [modalAtivo, setModalAtivo] = React.useState(null);

  const { uniformes, total, carregando, recarregar } = useUniformes({
    busca,
    arquivado,
  });

  const handleSalvarUniforme = async (dadosUniforme) => {
    setSalvando(true);
    try {
      if (modalAtivo?.uniforme) {
        await produtoService.atualizarProduto(
          modalAtivo.uniforme.id,
          dadosUniforme
        );
      } else {
        await produtoService.criarProduto({
          ...dadosUniforme,
          tipo: "uniforme",
        });
      }
      setModalAtivo(null);
      await recarregar();
    } catch {
      // Erro já exibido pelo Toast do apiClient
    } finally {
      setSalvando(false);
    }
  };

  const salvarMovimentacaoEstoque = async (movimentacao) => {
    if (!modalAtivo?.uniforme) return;

    setSalvando(true);

    try {
      await produtoService.atualizarEstoque(
        modalAtivo.uniforme.id,
        movimentacao
      );
      setModalAtivo(null);
      await recarregar();
    } catch {
      // Erro já exibido pelo Toast do apiClient
    } finally {
      setSalvando(false);
    }
  };

  const confirmarArquivamento = async () => {
    if (!modalAtivo?.uniforme) return;

    setSalvando(true);

    try {
      await produtoService.atualizarProduto(
        modalAtivo.uniforme.id,
        { status: !modalAtivo.uniforme.status }
      );
      setModalAtivo(null);
      await recarregar();
    } catch {
      // Erro já exibido pelo Toast do apiClient
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirUniforme = async () => {
    if (!modalAtivo?.uniforme) return;

    setSalvando(true);

    try {
      await produtoService.excluirProduto(modalAtivo.uniforme.id);
      setModalAtivo(null);
      await recarregar();
    } catch {
      // Erro já exibido pelo Toast do apiClient
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
      label: "Status",
      render: (uniforme) => {
        const isAtivo = Boolean(uniforme.status);
        return (
          <Badge
            variant={isAtivo ? "success" : "neutral"}
            dot
            size="sm"
          >
            {isAtivo ? "Ativo" : "Arquivado"}
          </Badge>
        );
      },
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (uniforme) => {
        const isArquivado = !uniforme.status;
        const podeExcluir = ehAdmin && isArquivado;

        return (
          <TableMenuActions
            label={`Ações do uniforme ${uniforme.nome}`}
            itens={[
              {
                label: "Editar uniforme",
                icone: FiIcons.FiEdit2,
                onClick: () => setModalAtivo({ tipo: "edicao", uniforme }),
              },
              {
                label: "Movimentar estoque",
                icone: FiIcons.FiPackage,
                onClick: () => setModalAtivo({ tipo: "estoque", uniforme }),
              },
              {
                label: isArquivado ? "Desarquivar" : "Arquivar",
                icone: isArquivado ? FiIcons.FiRotateCcw : FiIcons.FiArchive,
                onClick: () => setModalAtivo({ tipo: "arquivar", uniforme }),
                variante: isArquivado ? "success" : "danger",
              },
              podeExcluir && {
                label: "Excluir",
                icone: FiIcons.FiTrash2,
                onClick: () => setModalAtivo({ tipo: "excluir", uniforme }),
                variante: "danger",
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
          {(() => {
            const s = total === 1 ? "" : "s";
            return `
              ${total} uniforme${s} ${arquivado ? "arquivado" : "ativo"} 
              encontrado${s}.`;
          })()}
        </p>

        <Button
          leftIcon={<FiIcons.FiPlus />}
          className="w-full sm:w-auto"
          onClick={() => setModalAtivo({ tipo: "cadastro" })}
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

      <DataTable
        columns={columnsUniforme}
        data={carregando ? [] : uniformes}
        getRowKey={(uniforme) => uniforme.id}
        emptyMessage={
          carregando
            ? "Carregando uniformes..."
            : arquivado
              ? "Nenhum uniforme arquivado encontrado."
              : "Nenhum uniforme ativo encontrado."
        }
      />

      <UniformeModal
        aberto={modalAtivo?.tipo === "cadastro" || modalAtivo?.tipo === "edicao"}
        uniforme={modalAtivo?.tipo === "edicao" ? modalAtivo.uniforme : null}
        onFechar={() => setModalAtivo(null)}
        onSalvar={handleSalvarUniforme}
        salvando={salvando}
      />

      <MovimentarEstoqueModal
        key={
          modalAtivo?.tipo === "estoque"
            ? `estoque-${modalAtivo.uniforme.id}`
            : "sem-uniforme-estoque"
        }
        uniforme={modalAtivo?.tipo === "estoque" ? modalAtivo.uniforme : null}
        onFechar={() => setModalAtivo(null)}
        onSalvar={salvarMovimentacaoEstoque}
        salvando={salvando}
      />

      <ConfirmarModal
        aberto={modalAtivo?.tipo === "arquivar"}
        onFechar={() => setModalAtivo(null)}
        onConfirmar={confirmarArquivamento}
        titulo={
          !modalAtivo?.uniforme?.status
            ? "Desarquivar uniforme"
            : "Arquivar uniforme"
        }
        mensagem={
          !modalAtivo?.uniforme?.status
            ? `Deseja desarquivar o uniforme ${modalAtivo?.uniforme?.nome}?`
            : `Deseja arquivar o uniforme ${modalAtivo?.uniforme?.nome}? Ele deixará de aparecer entre os uniformes ativos.`
        }
        textoConfirmar={
          !modalAtivo?.uniforme?.status
            ? "Desarquivar"
            : "Arquivar"
        }
        variante={
          !modalAtivo?.uniforme?.status
            ? "success"
            : "danger"
        }
        salvando={salvando}
      />

      <ConfirmarModal
        aberto={modalAtivo?.tipo === "excluir"}
        onFechar={() => setModalAtivo(null)}
        onConfirmar={handleExcluirUniforme}
        titulo="Excluir uniforme"
        mensagem={`Tem certeza de que deseja excluir permanentemente o uniforme ${modalAtivo?.uniforme?.nome}? Esta ação é irreversível e removerá todos os registros associados a este produto.`}
        textoConfirmar="Excluir definitivamente"
        variante="danger"
        salvando={salvando}
      />
    </section>
  );
};

export default SecaoUniformes;