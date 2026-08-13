import * as FiIcons from "react-icons/fi";

export const adminNavigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: FiIcons.FiHome },
  { label: "Filas", path: "/admin/filas", icon: FiIcons.FiClipboard },
  { label: "Alunos", path: "/admin/alunos", icon: FiIcons.FiUser },
  { label: "Cursos", path: "/admin/cursos", icon: FiIcons.FiBookOpen },
  { label: "Produtos", path: "/admin/produtos", icon: FiIcons.FiBox },
  { label: "Relatórios", path: "/admin/relatorios", icon: FiIcons.FiBarChart2 },
  { label: "Usuários", path: "/admin/usuarios", icon: FiIcons.FiUsers },
];
export const adminFooterNavigation = [
  {
    label: "Configurações",
    path: "/admin/configuracoes",
    icon: FiIcons.FiSettings,
  },
];
