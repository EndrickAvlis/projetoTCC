import { NavLink } from "react-router-dom";

const AdminNavItem = ({ item, collapsed }) => {
  const {
    label,
    path,
    icon: Icon,
  } = item;

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center rounded-xl py-3 text-sm font-medium transition-colors ${
          collapsed
            ? "justify-center px-0"
            : "gap-3 px-3"
        } ${
          isActive
            ? "bg-admin-sidebar-active text-text-inverse"
            : "text-admin-sidebar-text hover:bg-admin-sidebar-hover"
        }`
      }
    >
      <Icon
        size={19}
        className="shrink-0"
      />

      {!collapsed && (
        <span className="whitespace-nowrap">
          {label}
        </span>
      )}
    </NavLink>
  );
};

export default AdminNavItem;