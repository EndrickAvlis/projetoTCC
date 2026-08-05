import { useLocation } from "react-router-dom";
import { FiGrid } from "react-icons/fi";
import {
  adminNavigation,
  adminFooterNavigation,
} from "../constants/adminNavigation";
import { useAuth } from "../../../hooks/useAuth";

const adminRoutes = [
  ...adminNavigation,
  ...adminFooterNavigation,
];

const AdminHeader = () => {
  const { usuario } = useAuth();
  const { pathname } = useLocation();

  const currentRoute = adminRoutes.find(({ path }) =>
    pathname.startsWith(path)
  );

  const pageTitle = currentRoute?.label ?? "Administração";
  const PageIcon = currentRoute?.icon ?? FiGrid;
  const adminName = usuario?.nome?.trim() || "Administrador";
  const adminInitials = adminName
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary ring-1 ring-border">
            <PageIcon size={21} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Painel administrativo
            </p>
            <h1 className="truncate text-xl font-semibold text-text-primary">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-surface-muted px-3 py-2">
          <div className="hidden max-w-52 text-right sm:block">
            <p className="text-xs text-text-secondary">Seja bem-vindo</p>
            <p className="truncate text-sm font-semibold text-text-primary">
              {adminName}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-text-inverse">
            {adminInitials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
