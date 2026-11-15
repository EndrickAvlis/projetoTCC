import * as React from "react";
import {
  FiEdit2,
  FiPackage,
  FiRotateCcw,
  FiArchive,
  FiPlus,
  FiSearch,
} from "react-icons/fi";

import Alert from "../../../../../components/ui/Alert";
import Badge from "../../../../../components/ui/Badge";
import Button from "../../../../../components/ui/Button";
import DataTable from "../../../../../components/ui/DataTable";
import Input from "../../../../../components/ui/Input";
import TableFiltro from "../../../../../components/ui/TableFiltro";
import TableMenuActions from "../../../../../components/ui/TableMenuActions";
import ConfirmarModal from "../../../../../components/ui/ConfirmarModal";

import UniformeModal from "./UniformeModal";
import MovimentarEstoqueModal from "./MovimentarEstoqueModal";

import { useUniformes } from "../../../hooks/useUniformes";
import * as produtoService from "../../../services/produtoService";
import { formatarMoeda } from "../../../../../utils/formatters";
import { useToast } from "../../../../../context/toastContext";

const OPCOES_UNIFORME = [
  { valor: false, label: "Ativos" },
  { valor: true, label: "Arquivados" },
];

const corEstoque = (quantidade) => {
  if (quantidade === 0) return "text-status-danger";
  if (quantidade < 10) return "text-status-warning";
  return "text-status-success";
};

const SecaoUniformes = () => {
  const toast = useToast();

  const [busca, setBusca] = React.useState("");
  const [arquivado, setArquivado] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const [modalAtivo, setModalAtivo] = React.useState(null);

  const { uniformes, total, carregando, erro, recarregar } = useUniformes({
    busca,
    arquivado,
  });

  const handleSalvarUniforme = async (dadosUniforme) => {
    const emEdicao = Boolean(modalAtivo?.uniforme);
    setSalvando(true);

    try {
      if (emEdicao) {
        await produtoService.atualizarProduto(
          modalAtivo.uniforme.id,
          dadosUniforme,
        );
      } else {
        await produtoService.criarProduto({
          ...dadosUniforme,
          tipo: "uniforme",
        });
      }

      setModalAtivo(null);
      toast.sucesso(
        emEdicao
          ? "Uniforme atualizado com sucesso."
          : "Uniforme adicionado com sucesso.",
      );
      await recarregar({ silencioso: true });
    } catch (err) {
      toast.erro(err.message);
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
        movimentacao,
      );
      setModalAtivo(null);
      toast.sucesso("Estoque atualizado com sucesso.");
      await recarregar({ silencioso: true });
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const confirmarArquivamento = async () => {
    if (!modalAtivo?.uniforme) return;

    const proximoStatus = !modalAtivo.uniforme.status;
    setSalvando(true);

    try {
      await produtoService.atualizarProduto(modalAtivo.uniforme.id, {
        status: proximoStatus,
      });
      setModalAtivo(null);
      toast.sucesso(
        proximoStatus
          ? "Uniforme desarquivado com sucesso."
          : "Uniforme arquivado com sucesso.",
      );
      await recarregar({ silencioso: true });
    } catch (err) {
      toast.erro(err.message);
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
      label: "Estoque",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (uniforme) => (
        <span className={`font-semibold ${corEstoque(uniforme.quantidade)}`}>
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
          <Badge variant={isAtivo ? "success" : "neutral"} dot size="sm">
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

        return (
          <TableMenuActions
            label={`Ações do uniforme ${uniforme.nome}`}
            itens={[
              {
                label: "Editar uniforme",
                icone: FiEdit2,
                onClick: () => setModalAtivo({ tipo: "edicao", uniforme }),
              },
              {
                label: "Movimentar estoque",
                icone: FiPackage,
                onClick: () => setModalAtivo({ tipo: "estoque", uniforme }),
              },
              {
                label: isArquivado ? "Desarquivar" : "Arquivar",
                icone: isArquivado ? FiRotateCcw : FiArchive,
                onClick: () => setModalAtivo({ tipo: "arquivar", uniforme }),
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
          {total} {total === 1 ? "uniforme" : "uniformes"}{" "}
          {arquivado ? "arquivado" : "ativo"}
          {total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}.
        </p>

        <Button
          leftIcon={<FiPlus />}
          className="w-full sm:w-auto"
          onClick={() => setModalAtivo({ tipo: "cadastro" })}
        >
          Adicionar uniforme
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Input
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Pesquisar por tamanho..."
          icon={<FiSearch />}
          size="md"
          className="max-w-xl"
        />

        <TableFiltro
          options={OPCOES_UNIFORME}
          value={arquivado}
          onChange={setArquivado}
          ariaLabel="Situação dos uniformes"
        />
      </div>

      {erro && <Alert type="error" message={erro} />}

      <DataTable
        columns={columnsUniforme}
        data={uniformes}
        carregando={carregando}
        getRowKey={(uniforme) => uniforme.id}
        emptyMessage={
          arquivado
            ? "Nenhum uniforme arquivado encontrado."
            : "Nenhum uniforme ativo encontrado."
        }
      />

      <UniformeModal
        aberto={
          modalAtivo?.tipo === "cadastro" || modalAtivo?.tipo === "edicao"
        }
        uniforme={modalAtivo?.tipo === "edicao" ? modalAtivo.uniforme : null}
        onFechar={() => setModalAtivo(null)}
        onSalvar={handleSalvarUniforme}
        salvando={salvando}
      />

      <MovimentarEstoqueModal
        aberto={modalAtivo?.tipo === "estoque"}
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
          !modalAtivo?.uniforme?.status ? "Desarquivar" : "Arquivar"
        }
        variante={!modalAtivo?.uniforme?.status ? "success" : "danger"}
        salvando={salvando}
      />
    </section>
  );
};

export default SecaoUniformes;
