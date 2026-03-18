import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const MonthSelector = () => {
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = useFinance();
  const [showList, setShowList] = useState(false);

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
    setShowList(false);
  };

  const selectMonth = (month: number) => {
    setSelectedMonth(month);
    setShowList(false);
  };

  const listYear = selectedYear;

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-3 py-2.5 px-4 bg-card/80 backdrop-blur-sm border-b border-border">
        <button
          onClick={goBack}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => setShowList(!showList)}
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

      {/* Month list dropdown */}
      {showList && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowList(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-lg p-3 w-[260px]">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setSelectedYear(selectedYear - 1)}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-semibold text-foreground">{listYear}</span>
              <button
                onClick={() => setSelectedYear(selectedYear + 1)}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {MONTHS.map((m, i) => {
                const isCurrent = i === now.getMonth() && listYear === now.getFullYear();
                const isSelected = i === selectedMonth && listYear === selectedYear;
                return (
                  <button
                    key={m}
                    onClick={() => selectMonth(i)}
                    className={cn(
                      "py-1.5 px-2 rounded-lg text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "bg-primary/15 text-primary hover:bg-primary/25"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthSelector;
