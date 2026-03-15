import FinanceSidebar from "@/components/FinanceSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <FinanceSidebar />
      </div>
      {/* Main content - add bottom padding on mobile for nav */}
      <div className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </div>
      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
