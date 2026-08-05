import {
    adminNavigation,
    adminFooterNavigation,
} from "../constants/adminNavigation";
import AdminLogoutButton from "../components/adminLogoutButton";
import AdminNavItem from "../components/adminNavItem";
import {
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";

const AdminSideBar = ({ collapsed, onToggle }) => {
    return (
        <aside className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden bg-admin-sidebar p-4 text-admin-sidebar-text transition-[width] duration-300 ${collapsed ? "w-20" : "w-72"}`}>
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
                {adminNavigation.map((item) => (
                    <AdminNavItem
                        key={item.path}
                        item={item}
                        collapsed={collapsed}
                    />
                ))}
            </nav>

            <div className="border-t border-admin-sidebar-divider pt-4">
                <nav className="space-y-1">
                    {adminFooterNavigation.map((item) => (
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
