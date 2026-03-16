import FinanceSidebar from "@/components/FinanceSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import MonthSelector from "@/components/MonthSelector";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <FinanceSidebar />
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        <MonthSelector />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
