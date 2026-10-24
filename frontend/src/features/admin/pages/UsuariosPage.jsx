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
  const [modalAtivo, setModalAtivo] = React.useState(null);

  const { usuarios, carregando, recarregar } = useUsuarios({
    busca,
    tipo: ehSupervisor ? "" : tipoFiltro,
    status: statusAtivo,
  });

  const handleSalvarUsuario = async (dados, id = modalAtivo?.usuario?.id) => {
    setSalvando(true);

    try {
      if (id) {
        await usuarioService.atualizarUsuario(id, dados);
      } else {
        await usuarioService.criarUsuario(dados);
      }

      setModalAtivo(null);
      await recarregar();
    } catch {
      // Erro já exibido pelo Toast do apiClient
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirUsuario = async () => {
    if (!modalAtivo?.usuario) return;
    setSalvando(true);

    try {
      await usuarioService.excluirUsuario(modalAtivo.usuario.id);
      setModalAtivo(null);
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
            label={`Ações do usuário ${u.nome}`}
            itens={[
              podeEditar && {
                label: "Editar",
                icone: FiIcons.FiEdit2,
                onClick: () => setModalAtivo({ tipo: "edicao", usuario: u }),
              },
              podeInativar && {
                label: u.status ? "Inativar" : "Ativar",
                icone: u.status ? FiIcons.FiUserX : FiIcons.FiUserCheck,
                onClick: () => setModalAtivo({ tipo: "status", usuario: u }),
                variante: u.status ? "danger" : "success",
              },
              podeExcluir && {
                label: "Excluir",
                icone: FiIcons.FiTrash2,
                onClick: () => setModalAtivo({ tipo: "excluir", usuario: u }),
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
            {usuariosOrdenados.length} {usuariosOrdenados.length === 1 ? "usuário" : "usuários"} {statusAtivo ? "ativo" : "inativo"}{usuariosOrdenados.length === 1 ? "" : "s"} encontrado{usuariosOrdenados.length === 1 ? "" : "s"}.
          </p>
        </div>

        <Button
          leftIcon={<FiIcons.FiPlus />}
          className="w-full sm:w-auto"
          onClick={() => setModalAtivo({ tipo: "cadastro" })}
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
        data={usuariosOrdenados}
        carregando={carregando}
        getRowKey={(u) => u.id}
        emptyMessage={
          statusAtivo
            ? "Nenhum usuário ativo encontrado."
            : "Nenhum usuário inativo encontrado."
        }
      />

      <UsuariosModal
        aberto={modalAtivo?.tipo === "cadastro" || modalAtivo?.tipo === "edicao"}
        usuario={modalAtivo?.tipo === "edicao" ? modalAtivo.usuario : null}
        usuarioLogado={usuarioLogado}
        onFechar={() => setModalAtivo(null)}
        onSalvar={handleSalvarUsuario}
        salvando={salvando}
      />

      <ConfirmarModal
        aberto={modalAtivo?.tipo === "status"}
        onFechar={() => setModalAtivo(null)}
        onConfirmar={() =>
          handleSalvarUsuario(
            { status: !modalAtivo?.usuario?.status },
            modalAtivo?.usuario?.id,
          )
        }
        titulo={
          modalAtivo?.usuario?.status
            ? "Inativar usuário"
            : "Ativar usuário"
        }
        mensagem={
          modalAtivo?.usuario?.status
            ? `Deseja realmente inativar o acesso de ${modalAtivo?.usuario?.nome}? O usuário não conseguirá mais entrar no sistema.`
            : `Deseja reativar o acesso de ${modalAtivo?.usuario?.nome}?`
        }
        textoConfirmar={
          modalAtivo?.usuario?.status ? "Inativar" : "Ativar"
        }
        variante={modalAtivo?.usuario?.status ? "danger" : "success"}
        salvando={salvando}
      />

      <ConfirmarModal
        aberto={modalAtivo?.tipo === "excluir"}
        onFechar={() => setModalAtivo(null)}
        onConfirmar={handleExcluirUsuario}
        titulo="Excluir usuário"
        mensagem={`Tem certeza de que deseja excluir permanentemente o usuário ${modalAtivo?.usuario?.nome}? Esta ação causará a exclusão de todos os dados associados a este usuário e não poderá ser desfeita.`}
        textoConfirmar="Excluir definitivamente"
        variante="danger"
        salvando={salvando}
      />
    </section>
  );
};

export default UsuariosPage;
