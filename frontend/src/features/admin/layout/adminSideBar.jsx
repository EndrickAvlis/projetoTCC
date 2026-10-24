import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../../context/authContext";
import * as AdminNavigation from "../constants/adminNavigation";

const AdminNavItem = ({ item, collapsed }) => {
  const { label, path, icon: Icon } = item;

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center rounded-xl py-3 text-sm font-medium transition-colors ${
          collapsed ? "justify-center px-0" : "gap-3 px-3"
        } ${
          isActive
            ? "bg-admin-sidebar-active text-text-inverse"
            : "text-admin-sidebar-text hover:bg-admin-sidebar-hover"
        }`
      }
    >
      <Icon size={19} className="shrink-0" />
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  );
};

const AdminLogoutButton = ({ collapsed }) => {
  const [loggingOut, setLoggingOut] = React.useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await logout();
    } catch {
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={`flex items-center rounded-xl py-3 text-sm font-medium transition-colors text-admin-sidebar-text hover:bg-admin-sidebar-hover w-full ${
        collapsed ? "justify-center px-0" : "gap-3 px-3"
      }`}
      title="Sair"
      aria-label="Sair do sistema"
    >
      <FiLogOut size={19} className="shrink-0" />
      {!collapsed && <span className="whitespace-nowrap">Sair</span>}
    </button>
  );
};

const AdminSideBar = ({ collapsed, onToggle }) => {
    return (
        <aside className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden bg-admin-sidebar p-4 text-admin-sidebar-text transition-[width] duration-250 ease-out ${collapsed ? "w-20" : "w-72"}`}>
            <div className="border-b border-admin-sidebar-divider pb-5">
                <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
                    {!collapsed && (
                        <div>
                            <p className="font-bold text-text-inverse">SIGA Phila</p>
                            <p className="text-base text-admin-sidebar-text-muted">
                                Administração
                            </p>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
                        className="rounded-lg p-2 text-admin-sidebar-text transition-colors hover:bg-admin-sidebar-hover"
                    >
                        {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
                    </button>
                </div>
            </div>
            <nav className="mt-5 flex-1 space-y-1">
                {AdminNavigation.adminNavigation.map((item) => (
                    <AdminNavItem
                        key={item.path}
                        item={item}
                        collapsed={collapsed}
                    />
                ))}
            </nav>

            <div className="border-t border-admin-sidebar-divider pt-4">
                <nav className="space-y-1">
                    {AdminNavigation.adminFooterNavigation.map((item) => (
                        <AdminNavItem
                            key={item.path}
                            item={item}
                            collapsed={collapsed}
                        />
                    ))}
                </nav>

                <AdminLogoutButton collapsed={collapsed} />
            </div>
        </aside>
    );
};

export default AdminSideBar;
