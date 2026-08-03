import { Outlet } from "react-router-dom";
import AdminHeader from "./adminHeader";
import AdminSideBar from "./adminSideBar";

const AdminLayout = () => {
    return (
        <div>
            <AdminSideBar/>
            <div>
                <AdminHeader/>
            </div>
            <main>
                <Outlet/>
            </main>
        </div>
    )
}
export default AdminLayout;