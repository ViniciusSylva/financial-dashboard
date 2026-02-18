import FinanceSidebar from "@/components/FinanceSidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <FinanceSidebar />
      <Outlet />
    </div>
  );
};

export default Layout;
