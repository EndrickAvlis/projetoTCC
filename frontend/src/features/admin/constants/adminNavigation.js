import {
  FiBarChart2,
  FiBookOpen,
  FiBox,
  FiClipboard,
  FiHome,
  FiSettings,
  FiUser,
  FiUsers,
} from "react-icons/fi";

export const adminNavigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: FiHome },
  { label: "Filas", path: "/admin/filas", icon: FiClipboard },
  { label: "Alunos", path: "/admin/alunos", icon: FiUser },
  { label: "Cursos", path: "/admin/cursos", icon: FiBookOpen },
  { label: "Produtos", path: "/admin/produtos", icon: FiBox },
  { label: "Relatórios", path: "/admin/relatorios", icon: FiBarChart2 },
  { label: "Usuários", path: "/admin/usuarios", icon: FiUsers },
];
export const adminFooterNavigation = [
  {
    label: "Configurações",
    path: "/admin/configuracoes",
    icon: FiSettings,
  },
];
