import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminHeader from "./adminHeader";
import AdminSideBar from "./adminSideBar";

const AdminLayout = () => {
    const [sideBarCollapsed, setSideBarCollapsed ] = useState(false);

    function toggleSideBar() {
        setSideBarCollapsed((currentState) => !currentState)
    }

  return (
    <div className="flex min-h-screen bg-page">
      <AdminSideBar
        collapsed={sideBarCollapsed}
        onToggle={toggleSideBar}
      />

      <div className="min-w-0 flex-1">
        <AdminHeader />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
