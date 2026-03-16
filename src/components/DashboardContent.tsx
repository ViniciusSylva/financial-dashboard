import { CreditCard, Wallet, TrendingDown, DollarSign, Gift } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const DashboardContent = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const {
    getCardTotalByMonth, getCardUnpaidTotalByMonth,
    getExpensesTotalByMonth, getExpensesUnpaidTotalByMonth,
    getCardExpensesByMonth, getGeneralExpensesByMonth,
    getSalaryByMonth, getValeByMonth, getExtraIncomeByMonth,
    getUsedFromSource,
  } = useFinance();

  const cardTotal = getCardTotalByMonth(currentYear, currentMonth);
  const cardUnpaid = getCardUnpaidTotalByMonth(currentYear, currentMonth);
  const expensesTotal = getExpensesTotalByMonth(currentYear, currentMonth);
  const expensesUnpaid = getExpensesUnpaidTotalByMonth(currentYear, currentMonth);

  const salary = getSalaryByMonth(currentYear, currentMonth);
  const vale = getValeByMonth(currentYear, currentMonth);
  const extraIncomes = getExtraIncomeByMonth(currentYear, currentMonth);
  const extraTotal = extraIncomes.reduce((s, i) => s + i.value, 0);

  const usedSalary = getUsedFromSource(currentYear, currentMonth, "salary");
  const usedExtra = getUsedFromSource(currentYear, currentMonth, "extra");
  const usedVale = getUsedFromSource(currentYear, currentMonth, "vale");

  const remainingSalary = salary - usedSalary;
  const remainingExtra = extraTotal - usedExtra;
  const remainingVale = vale - usedVale;

  const totalAll = cardTotal + expensesTotal;
  const totalUnpaid = cardUnpaid + expensesUnpaid;

  const cardExpenses = getCardExpensesByMonth(currentYear, currentMonth);
  const generalExpenses = getGeneralExpensesByMonth(currentYear, currentMonth);

  const allExpenses = [
    ...cardExpenses.map(e => ({ ...e, source: "Cartão", color: "text-destructive" })),
    ...generalExpenses.map(e => ({ ...e, source: "Gasto", color: "text-finance-blue" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Visão geral de {MONTHS[currentMonth]} {currentYear}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Account Balances */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {/* Salary */}
              <div className="bg-card border border-border rounded-xl p-3 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Salário (limpo)</span>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-finance-yellow/20"><DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-finance-yellow" /></div>
                </div>
                <p className="text-[10px] xs:text-[11px] sm:text-lg font-bold text-finance-yellow break-all sm:break-normal">R$ {salary.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Restante</span>
                  <span className={cn("text-xs sm:text-sm font-bold", remainingSalary >= 0 ? "text-finance-green" : "text-destructive")}>
                    <span className="whitespace-nowrap">R$ {remainingSalary.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </span>
                </div>
              </div>

              {/* Vale */}
              <div className="bg-card border border-border rounded-xl p-3 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Vale</span>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-finance-green/20"><Gift className="h-3 w-3 sm:h-4 sm:w-4 text-finance-green" /></div>
                </div>
                <p className="text-[10px] xs:text-[11px] sm:text-lg font-bold text-finance-green break-all sm:break-normal">R$ {vale.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Restante</span>
                  <span className={cn("text-xs sm:text-sm font-bold", remainingVale >= 0 ? "text-finance-green" : "text-destructive")}>
                    <span className="whitespace-nowrap">R$ {remainingVale.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </span>
                </div>
              </div>

              {/* Extra */}
              <div className="bg-card border border-border rounded-xl p-3 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Extra</span>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-finance-cyan/20"><Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-finance-cyan" /></div>
                </div>
                <p className="text-[10px] xs:text-[11px] sm:text-lg font-bold text-finance-cyan break-all sm:break-normal">R$ {extraTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                {extraIncomes.map(inc => (
                  <p key={inc.id} className="text-[10px] sm:text-xs text-muted-foreground truncate">{inc.name}: R$ {inc.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                ))}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Restante</span>
                  <span className={cn("text-xs sm:text-sm font-bold", remainingExtra >= 0 ? "text-finance-green" : "text-destructive")}>
                    <span className="whitespace-nowrap">R$ {remainingExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {/* Total */}
              <div className="bg-card border border-border rounded-xl p-3 sm:p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Geral</span>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-finance-yellow/20"><Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-finance-yellow" /></div>
                </div>
                <p className="text-xs sm:text-2xl font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">R$ {totalAll.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 whitespace-nowrap overflow-hidden text-ellipsis">A pagar: <span className="text-finance-yellow font-semibold">R$ {totalUnpaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></p>
              </div>

              {/* Gastos */}
              <div className="bg-[hsl(220_90%_56%/0.05)] border border-finance-blue/20 rounded-xl p-3 sm:p-5 transition-all duration-300 hover:border-finance-blue/40 hover:shadow-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Gastos</span>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-finance-blue/20"><TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-finance-blue" /></div>
                </div>
                <p className="text-xs sm:text-2xl font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">R$ {expensesTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 whitespace-nowrap overflow-hidden text-ellipsis">A pagar: <span className="text-finance-blue font-semibold">R$ {expensesUnpaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></p>
              </div>

              {/* Cartão */}
              <div className="bg-[hsl(0_72%_56%/0.05)] border border-destructive/20 rounded-xl p-3 sm:p-5 transition-all duration-300 hover:border-destructive/40 hover:shadow-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Cartão</span>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-destructive/20"><CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" /></div>
                </div>
                <p className="text-xs sm:text-2xl font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">R$ {cardTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 whitespace-nowrap overflow-hidden text-ellipsis">A pagar: <span className="text-destructive font-semibold">R$ {cardUnpaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Transações Recentes</h3>
              {allExpenses.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Nenhuma transação neste mês.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {allExpenses.map((tx) => (
                    <div key={tx.id} className={cn("flex items-center justify-between py-2 border-b border-border last:border-0", tx.paid && "opacity-50")}>
                      <div className="min-w-0 flex-1 mr-2">
                        <p className={cn("text-sm font-medium text-foreground truncate", tx.paid && "line-through")}>{tx.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{tx.category} · {tx.source} {tx.paid ? "· Pago ✓" : ""}</p>
                      </div>
                      <span className={cn("text-sm font-semibold whitespace-nowrap", tx.color)}>-R$ {tx.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendar - hidden on small mobile */}
          <div className="hidden sm:block lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-center">
              <Calendar
                mode="single"
                selected={now}
                className={cn("p-0 w-full pointer-events-auto [&_.rdp-day_today]:bg-primary/20 [&_.rdp-day_today]:text-primary [&_.rdp-day_today]:font-semibold")}
                classNames={{
                  months: "flex flex-col w-full", month: "space-y-2 w-full",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-muted-foreground",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-border",
                  nav_button_previous: "absolute left-1", nav_button_next: "absolute right-1",
                  table: "w-full border-collapse", head_row: "flex justify-between",
                  head_cell: "text-muted-foreground rounded-md flex-1 text-center font-normal text-[0.75rem]",
                  row: "flex w-full justify-between mt-2", cell: "flex-1 aspect-square text-center text-sm p-0 relative flex items-center justify-center",
                  day: "h-9 w-9 p-0 font-normal text-muted-foreground hover:bg-secondary rounded-md inline-flex items-center justify-center",
                  day_selected: "bg-primary/20 text-primary font-semibold hover:bg-primary/30",
                  day_today: "bg-primary/15 text-primary font-semibold",
                  day_outside: "text-muted-foreground/30", day_disabled: "text-muted-foreground/30", day_hidden: "invisible",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
