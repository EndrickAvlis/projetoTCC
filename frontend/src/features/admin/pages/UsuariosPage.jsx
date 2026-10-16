import * as React from "react";
import * as FiIcons from "react-icons/fi";

import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import TableFiltro from "../../../components/ui/TableFiltro";
import TableMenuActions from "../../../components/ui/TableMenuActions";
import ConfirmarModal from "../../../components/ui/ConfirmarModal";

import UsuariosModal from "../components/usuarios/UsuariosModal";
import { useUsuarios } from "../hooks/useUsuarios";
import * as usuarioService from "../services/usuarioService";
import { useAuth } from "../../../context/authContext";

const OPCOES_FILTRO_TIPO = [
  { value: "", label: "Todos os perfis" },
  { value: "admin", label: "Administradores" },
  { value: "supervisor", label: "Supervisores" },
  { value: "atendente", label: "Atendentes" },
];

const OPCOES_STATUS_USUARIO = [
  { valor: true, label: "Ativos" },
  { valor: false, label: "Inativos" },
];

const UsuariosPage = () => {
  const { usuario: usuarioLogado } = useAuth();
  const ehSupervisor = usuarioLogado?.tipo === "supervisor";
  const ehAdmin = usuarioLogado?.tipo === "admin";

  const [busca, setBusca] = React.useState("");
  const [tipoFiltro, setTipoFiltro] = React.useState("");
  const [statusAtivo, setStatusAtivo] = React.useState(true);

  const [salvando, setSalvando] = React.useState(false);

  const [modalUsuarioAberto, setModalUsuarioAberto] = React.useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = React.useState(null);
  const [usuarioParaAlterarStatus, setUsuarioParaAlterarStatus] =
    React.useState(null);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = React.useState(null);

  const { usuarios, carregando, erro, recarregar } = useUsuarios({
    busca,
    tipo: ehSupervisor ? "" : tipoFiltro,
    status: statusAtivo,
  });

  const abrirModalUsuario = (usuario = null) => {
    setUsuarioEmEdicao(usuario);
    setModalUsuarioAberto(true);
  };

  const fecharModalUsuario = () => {
    setModalUsuarioAberto(false);
    setUsuarioEmEdicao(null);
  };

  const handleSalvarUsuario = async (dados, id = usuarioEmEdicao?.id) => {
    setSalvando(true);

    try {
      if (id) {
        await usuarioService.atualizarUsuario(id, dados);
      } else {
        await usuarioService.criarUsuario(dados);
      }

      fecharModalUsuario();
      setUsuarioParaAlterarStatus(null);
      await recarregar();
    } catch {
      // Erro já exibido pelo Toast do apiClient
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirUsuario = async () => {
    if (!usuarioParaExcluir) return;
    setSalvando(true);

    try {
      await usuarioService.excluirUsuario(usuarioParaExcluir.id);
      setUsuarioParaExcluir(null);
      await recarregar();
    } catch {
      // Erro já exibido pelo Toast do apiClient
    } finally {
      setSalvando(false);
    }
  };

  const listaFiltrada = ehSupervisor
    ? usuarios.filter(
        (u) => u.tipo === "atendente" || u.id === usuarioLogado?.id,
      )
    : usuarios;

  const usuariosOrdenados = usuarioLogado
    ? [...listaFiltrada].sort((a, b) => {
        if (a.id === usuarioLogado.id) return -1;
        if (b.id === usuarioLogado.id) return 1;
        return 0;
      })
    : listaFiltrada;

  const renderBadgeTipo = (tipo) => {
    switch (tipo) {
      case "admin":
        return <Badge variant="primary">Administrador</Badge>;
      case "supervisor":
        return <Badge variant="warning">Supervisor</Badge>;
      case "atendente":
        return <Badge variant="neutral">Atendente</Badge>;
      default:
        return <Badge variant="neutral">{tipo}</Badge>;
    }
  };

  const columnsUsuario = [
    {
      key: "nome",
      label: "Nome",
      render: (u) => {
        const ehProprioUsuario = u.id === usuarioLogado?.id;
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">{u.nome}</span>
            {ehProprioUsuario && (
              <Badge variant="primary" size="sm">
                Você
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (u) => renderBadgeTipo(u.tipo),
    },
    {
      key: "status",
      label: "Status",
      render: (u) =>
        u.status ? (
          <Badge variant="success" dot>
            Ativo
          </Badge>
        ) : (
          <Badge variant="danger" dot>
            Inativo
          </Badge>
        ),
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (u) => {
        const ehProprioUsuario = u.id === usuarioLogado?.id;
        const podeEditar =
          ehAdmin || ehProprioUsuario || u.tipo === "atendente";
        const podeInativar =
          !ehProprioUsuario && (ehAdmin || u.tipo === "atendente");
        const podeExcluir = !ehProprioUsuario && ehAdmin && !u.status;

        return (
          <TableMenuActions
            labelAria={`Ações do usuário ${u.nome}`}
            itens={[
              podeEditar && {
                label: "Editar",
                icone: FiIcons.FiEdit2,
                onClick: () => abrirModalUsuario(u),
              },
              podeInativar && {
                label: u.status ? "Inativar" : "Ativar",
                icone: u.status ? FiIcons.FiUserX : FiIcons.FiUserCheck,
                onClick: () => setUsuarioParaAlterarStatus(u),
                variante: u.status ? "danger" : "success",
              },
              podeExcluir && {
                label: "Excluir",
                icone: FiIcons.FiTrash2,
                onClick: () => setUsuarioParaExcluir(u),
                variante: "danger",
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-text-secondary">
            {(() => {
              const s = usuariosOrdenados.length === 1 ? "" : "s";
              return `${usuariosOrdenados.length} usuário${s} ${statusAtivo ? "ativo" : "inativo"}${s} encontrado${s}.`;
            })()}
          </p>
        </div>

        <Button
          leftIcon={<FiIcons.FiPlus />}
          className="w-full sm:w-auto"
          onClick={() => abrirModalUsuario()}
        >
          Adicionar usuário
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Pesquisar por nome de usuário..."
            icon={<FiIcons.FiSearch />}
            size="md"
            className="w-full sm:max-w-md"
          />

          {!ehSupervisor && (
            <div className="w-full sm:w-56">
              <Select
                value={tipoFiltro}
                onChange={(event) => setTipoFiltro(event.target.value)}
                options={OPCOES_FILTRO_TIPO}
                placeholder=""
              />
            </div>
          )}
        </div>

        <TableFiltro
          options={OPCOES_STATUS_USUARIO}
          value={statusAtivo}
          onChange={setStatusAtivo}
          ariaLabel="Situação dos usuários"
        />
      </div>
      <DataTable
        columns={columnsUsuario}
        data={carregando ? [] : usuariosOrdenados}
        getRowKey={(u) => u.id}
        emptyMessage={
          erro
            ? erro
            : carregando
              ? "Carregando usuários..."
              : statusAtivo
                ? "Nenhum usuário ativo encontrado."
                : "Nenhum usuário inativo encontrado."
        }
      />

      <UsuariosModal
        aberto={modalUsuarioAberto}
        usuario={usuarioEmEdicao}
        usuarioLogado={usuarioLogado}
        onFechar={fecharModalUsuario}
        onSalvar={handleSalvarUsuario}
        salvando={salvando}
      />

      <ConfirmarModal
        aberto={Boolean(usuarioParaAlterarStatus)}
        onFechar={() => setUsuarioParaAlterarStatus(null)}
        onConfirmar={() =>
          handleSalvarUsuario(
            { status: !usuarioParaAlterarStatus.status },
            usuarioParaAlterarStatus.id,
          )
        }
        titulo={
          usuarioParaAlterarStatus?.status
            ? "Inativar usuário"
            : "Ativar usuário"
        }
        mensagem={
          usuarioParaAlterarStatus?.status
            ? `Deseja realmente inativar o acesso de ${usuarioParaAlterarStatus?.nome}? O usuário não conseguirá mais entrar no sistema.`
            : `Deseja reativar o acesso de ${usuarioParaAlterarStatus?.nome}?`
        }
        textoConfirmar={
          usuarioParaAlterarStatus?.status ? "Inativar" : "Ativar"
        }
        variante={usuarioParaAlterarStatus?.status ? "danger" : "success"}
        salvando={salvando}
      />

      <ConfirmarModal
        aberto={Boolean(usuarioParaExcluir)}
        onFechar={() => setUsuarioParaExcluir(null)}
        onConfirmar={handleExcluirUsuario}
        titulo="Excluir usuário"
        mensagem={`Tem certeza de que deseja excluir permanentemente o usuário ${usuarioParaExcluir?.nome}? Esta ação causará a exclusão de todos os dados associados a este usuário e não poderá ser desfeita.`}
        textoConfirmar="Excluir definitivamente"
        variante="danger"
        salvando={salvando}
      />
    </section>
  );
};

export default UsuariosPage;
