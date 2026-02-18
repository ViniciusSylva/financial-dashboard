import { useState } from "react";
import { CreditCard, Wallet, TrendingDown, DollarSign, Plus, X } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const DashboardContent = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const {
    getCardTotalByMonth, getExpensesTotalByMonth,
    getCardExpensesByMonth, getGeneralExpensesByMonth,
    getSalaryByMonth, getExtraIncomeByMonth, getIncomeTotalByMonth,
    updateSalary, addIncome, removeIncome,
  } = useFinance();

  const cardTotal = getCardTotalByMonth(currentYear, currentMonth);
  const expensesTotal = getExpensesTotalByMonth(currentYear, currentMonth);
  const totalGastos = cardTotal + expensesTotal;
  const salary = getSalaryByMonth(currentYear, currentMonth);
  const extraIncomes = getExtraIncomeByMonth(currentYear, currentMonth);
  const totalIncome = getIncomeTotalByMonth(currentYear, currentMonth);

  const cardExpenses = getCardExpensesByMonth(currentYear, currentMonth);
  const generalExpenses = getGeneralExpensesByMonth(currentYear, currentMonth);

  const allExpenses = [
    ...cardExpenses.map(e => ({ ...e, source: "Cartão" })),
    ...generalExpenses.map(e => ({ ...e, source: "Gasto" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Salary edit
  const [salaryInput, setSalaryInput] = useState(salary > 0 ? salary.toString() : "");
  const [editingSalary, setEditingSalary] = useState(false);

  // Extra income dialog
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraName, setExtraName] = useState("");
  const [extraValue, setExtraValue] = useState("");

  const handleSalarySave = () => {
    const v = parseFloat(salaryInput.replace(",", "."));
    if (!isNaN(v) && v >= 0) {
      updateSalary(v);
      setEditingSalary(false);
    }
  };

  const handleAddExtra = () => {
    const v = parseFloat(extraValue.replace(",", "."));
    if (extraName.trim() && !isNaN(v) && v > 0) {
      addIncome({ name: extraName.trim(), value: v, type: "extra", date: new Date().toISOString() });
      setExtraName("");
      setExtraValue("");
      setExtraOpen(false);
    }
  };

  const summaryCards = [
    { title: "Total Gastos", value: totalGastos, icon: Wallet, colorClass: "text-finance-green", iconBg: "bg-finance-green/20" },
    { title: "Fatura Cartão", value: cardTotal, icon: CreditCard, colorClass: "text-finance-blue", iconBg: "bg-finance-blue/20" },
    { title: "Gastos Gerais", value: expensesTotal, icon: TrendingDown, colorClass: "text-finance-pink", iconBg: "bg-finance-pink/20" },
  ];

  const saldo = totalIncome - totalGastos;

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral de {MONTHS[currentMonth]} {currentYear}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Income Section */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-finance-yellow" />
                  Renda do Mês
                </h3>
                <Dialog open={extraOpen} onOpenChange={setExtraOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1 text-xs text-finance-cyan hover:text-finance-cyan/80 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Renda Extra
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Renda Extra</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                      <Input placeholder="Descrição (ex: Freelance)" value={extraName} onChange={e => setExtraName(e.target.value)} />
                      <Input placeholder="Valor" type="number" step="0.01" value={extraValue} onChange={e => setExtraValue(e.target.value)} />
                      <Button onClick={handleAddExtra} className="w-full">Adicionar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Salary */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Salário Fixo</span>
                {editingSalary ? (
                  <div className="flex items-center gap-2">
                    <Input
                      className="w-32 h-8 text-sm"
                      type="number" step="0.01"
                      value={salaryInput}
                      onChange={e => setSalaryInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSalarySave()}
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={handleSalarySave} className="h-8 text-xs">OK</Button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setSalaryInput(salary > 0 ? salary.toString() : ""); setEditingSalary(true); }}
                    className="text-sm font-semibold text-finance-yellow hover:underline"
                  >
                    {salary > 0 ? `R$ ${salary.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Definir salário"}
                  </button>
                )}
              </div>

              {/* Extra incomes */}
              {extraIncomes.map(inc => (
                <div key={inc.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{inc.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-finance-cyan">
                      +R$ {inc.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => removeIncome(inc.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total + Saldo */}
              <div className="flex items-center justify-between pt-3 mt-2">
                <span className="text-xs text-muted-foreground">Total Renda</span>
                <span className="text-sm font-bold text-foreground">
                  R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Saldo</span>
                <span className={cn("text-sm font-bold", saldo >= 0 ? "text-finance-green" : "text-finance-pink")}>
                  R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {summaryCards.map((card) => (
                <div key={card.title} className="bg-card border border-border rounded-xl p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</span>
                    <div className={`p-2 rounded-lg ${card.iconBg}`}>
                      <card.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {card.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Transactions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Transações Recentes</h3>
              {allExpenses.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Nenhuma transação neste mês.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {allExpenses.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.name}</p>
                        <p className="text-xs text-muted-foreground">{tx.category} · {tx.source}</p>
                      </div>
                      <span className="text-sm font-semibold text-finance-pink">
                        -R$ {tx.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4">
              <Calendar
                mode="single"
                selected={now}
                className={cn("p-0 pointer-events-auto [&_.rdp-day_today]:bg-primary/20 [&_.rdp-day_today]:text-primary [&_.rdp-day_today]:font-semibold")}
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-2",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-xs font-medium text-muted-foreground",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-border",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.65rem]",
                  row: "flex w-full mt-1",
                  cell: "h-8 w-8 text-center text-xs p-0 relative",
                  day: "h-8 w-8 p-0 font-normal text-muted-foreground hover:bg-secondary rounded-md inline-flex items-center justify-center",
                  day_selected: "bg-primary/20 text-primary font-semibold hover:bg-primary/30",
                  day_today: "bg-primary/15 text-primary font-semibold",
                  day_outside: "text-muted-foreground/30",
                  day_disabled: "text-muted-foreground/30",
                  day_hidden: "invisible",
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
