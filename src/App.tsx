import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/contexts/FinanceContext";
import Layout from "@/components/Layout";
import DashboardContent from "@/components/DashboardContent";
import CardContent from "@/components/CardContent";
import ExpensesContent from "@/components/ExpensesContent";
import ReportsContent from "@/components/ReportsContent";
import GoalsContent from "@/components/GoalsContent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FinanceProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardContent />} />
              <Route path="/cartao" element={<CardContent />} />
              <Route path="/gastos" element={<ExpensesContent />} />
              <Route path="/metas" element={<GoalsContent />} />
              <Route path="/relatorios" element={<ReportsContent />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
