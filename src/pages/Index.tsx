import FinanceSidebar from "@/components/FinanceSidebar";
import DashboardContent from "@/components/DashboardContent";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <FinanceSidebar />
      <DashboardContent />
    </div>
  );
};

export default Index;
