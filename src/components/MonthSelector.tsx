import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const MonthSelector = () => {
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = useFinance();

  const goBack = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goForward = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const now = new Date();
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  const goToday = () => {
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  };

  return (
    <div className="flex items-center justify-center gap-3 py-2.5 px-4 bg-card/80 backdrop-blur-sm border-b border-border">
      <button
        onClick={goBack}
        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        onClick={goToday}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-secondary transition-colors min-w-[120px] justify-center"
      >
        <span className="text-sm font-semibold text-foreground">{MONTHS[selectedMonth]}</span>
        <span className="text-sm text-muted-foreground">{selectedYear}</span>
      </button>

      <button
        onClick={goForward}
        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {!isCurrentMonth && (
        <button
          onClick={goToday}
          className="text-[10px] sm:text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Hoje
        </button>
      )}
    </div>
  );
};

export default MonthSelector;
