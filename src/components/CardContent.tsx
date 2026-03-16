import { useState, useEffect } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { useFinance, PaymentSources } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import PaymentSourceDialog from "./PaymentSourceDialog";

const categories = ["Alimentação", "Compras", "Assinaturas", "Transporte", "Lazer", "Saúde", "Outros"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const CardContent = () => {
  const {
    selectedYear, selectedMonth,
    cardExpenses, addCardExpense, removeCardExpense,
    markCardExpensePaid, unmarkCardExpensePaid,
    getCardTotalByMonth, getCardUnpaidTotalByMonth,
    getCardExpensesByMonth,
    getSalaryByMonth, getValeByMonth, getExtraIncomeByMonth, getUsedFromSource,
  } = useFinance();

  const currentMonth = selectedMonth;
  const currentYear = selectedYear;

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [open, setOpen] = useState(false);
  const [payDialog, setPayDialog] = useState<{ id: string; name: string; value: number } | null>(null);

  const total = getCardTotalByMonth(currentYear, currentMonth);
  const unpaidTotal = getCardUnpaidTotalByMonth(currentYear, currentMonth);
  const monthExpenses = getCardExpensesByMonth(currentYear, currentMonth);

  const salary = getSalaryByMonth(currentYear, currentMonth);
  const vale = getValeByMonth(currentYear, currentMonth);
  const extraIncomes = getExtraIncomeByMonth(currentYear, currentMonth);
  const extraTotal = extraIncomes.reduce((s, i) => s + i.value, 0);
  const usedSalary = getUsedFromSource(currentYear, currentMonth, "salary");
  const usedExtra = getUsedFromSource(currentYear, currentMonth, "extra");
  const usedVale = getUsedFromSource(currentYear, currentMonth, "vale");

  const handleAdd = () => {
    if (!name.trim() || !value) return;
    const date = new Date(currentYear, currentMonth, 15).toISOString();
    addCardExpense({ name: name.trim(), category, value: parseFloat(value), date });
    setName(""); setValue(""); setCategory(categories[0]); setOpen(false);
  };

  const handleCheckboxChange = (expense: { id: string; name: string; value: number; paid: boolean }) => {
    if (expense.paid) {
      unmarkCardExpensePaid(expense.id);
    } else {
      setPayDialog({ id: expense.id, name: expense.name, value: expense.value });
    }
  };

  const handlePayConfirm = (sources: PaymentSources) => {
    if (payDialog) { markCardExpensePaid(payDialog.id, sources); setPayDialog(null); }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Cartão</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Gerencie os gastos do seu cartão de crédito</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 sm:p-3 rounded-lg bg-destructive/20 shrink-0"><CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" /></div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Fatura {MONTHS[currentMonth]}</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">A pagar: <span className="text-destructive font-semibold">R$ {unpaidTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></p>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-destructive hover:bg-destructive/80 text-white shrink-0">
                  <Plus className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Adicionar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="text-foreground">Novo Gasto no Cartão</DialogTitle></DialogHeader>
                <div className="flex flex-col gap-4 mt-2">
                  <Input placeholder="Nome do gasto" value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border" />
                  <Input type="number" placeholder="Valor (R$)" value={value} onChange={e => setValue(e.target.value)} className="bg-secondary border-border" />
                  <select value={category} onChange={e => setCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Button onClick={handleAdd} className="bg-destructive hover:bg-destructive/80 text-white">Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Gastos do Cartão — {MONTHS[currentMonth]}</h3>
          {monthExpenses.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum gasto registrado neste mês.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...monthExpenses].reverse().map(expense => {
                const d = new Date(expense.date);
                const sourceLabel = expense.paid && expense.paymentSources
                  ? Object.entries(expense.paymentSources).filter(([,v]) => v && v > 0).map(([k]) => k === "salary" ? "Salário" : k === "extra" ? "Extra" : "Vale").join(" + ")
                  : "";
                return (
                  <div key={expense.id} className={cn(
                    "flex items-center justify-between py-3 px-3 sm:px-4 rounded-lg border border-border gap-2",
                    expense.paid ? "bg-destructive/5 opacity-60" : "bg-secondary/50"
                  )}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <Checkbox checked={expense.paid} onCheckedChange={() => handleCheckboxChange(expense)} className="shrink-0" />
                      <div className="min-w-0">
                        <p className={cn("text-xs sm:text-sm font-medium text-foreground truncate", expense.paid && "line-through")}>{expense.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {expense.category} · {MONTHS[d.getMonth()]}
                          {sourceLabel && <span className="ml-1 text-finance-green">· {sourceLabel}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-xs sm:text-sm font-semibold", expense.paid ? "text-muted-foreground" : "text-destructive")}>-R$ {expense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <button onClick={() => removeCardExpense(expense.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {payDialog && (
        <PaymentSourceDialog
          open={!!payDialog}
          onClose={() => setPayDialog(null)}
          expenseValue={payDialog.value}
          expenseName={payDialog.name}
          onConfirm={handlePayConfirm}
          availableSalary={salary - usedSalary}
          availableExtra={extraTotal - usedExtra}
          availableVale={vale - usedVale}
        />
      )}
    </div>
  );
};

export default CardContent;
