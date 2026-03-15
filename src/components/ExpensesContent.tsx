import { useState } from "react";
import { TrendingDown, Plus, Trash2, DollarSign, Pencil, Gift } from "lucide-react";
import { useFinance, PaymentSources } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import PaymentSourceDialog from "./PaymentSourceDialog";

const categories = ["Aluguel", "Alimentação", "Transporte", "Educação", "Saúde", "Lazer", "Contas", "Outros"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const ExpensesContent = () => {
  const now = new Date();
  const {
    generalExpenses, addGeneralExpense, removeGeneralExpense,
    markGeneralExpensePaid, unmarkGeneralExpensePaid,
    getSalaryByMonth, updateSalary,
    getValeByMonth, updateVale,
    getExtraIncomeByMonth, addIncome, removeIncome, updateIncome,
    getExpensesTotalByMonth, getExpensesUnpaidTotalByMonth,
    getUsedFromSource,
  } = useFinance();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [open, setOpen] = useState(false);

  // Salary
  const salary = getSalaryByMonth(currentYear, currentMonth);
  const [salaryInput, setSalaryInput] = useState(salary > 0 ? salary.toString() : "");
  const [editingSalary, setEditingSalary] = useState(false);

  // Vale
  const vale = getValeByMonth(currentYear, currentMonth);
  const [valeInput, setValeInput] = useState(vale > 0 ? vale.toString() : "");
  const [editingVale, setEditingVale] = useState(false);

  // Extra income
  const extraIncomes = getExtraIncomeByMonth(currentYear, currentMonth);
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraName, setExtraName] = useState("");
  const [extraValue, setExtraValue] = useState("");
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editingIncomeValue, setEditingIncomeValue] = useState("");

  // Payment source dialog
  const [payDialog, setPayDialog] = useState<{ id: string; name: string; value: number } | null>(null);

  const total = getExpensesTotalByMonth(currentYear, currentMonth);
  const unpaidTotal = getExpensesUnpaidTotalByMonth(currentYear, currentMonth);

  const usedSalary = getUsedFromSource(currentYear, currentMonth, "salary");
  const usedExtra = getUsedFromSource(currentYear, currentMonth, "extra");
  const usedVale = getUsedFromSource(currentYear, currentMonth, "vale");
  const extraTotal = extraIncomes.reduce((s, i) => s + i.value, 0);

  const totalDefined = salary + vale + extraTotal;
  const totalRemaining = totalDefined - (total - unpaidTotal);

  const handleAdd = () => {
    if (!name.trim() || !value) return;
    addGeneralExpense({ name: name.trim(), category, value: parseFloat(value), date: new Date().toISOString() });
    setName(""); setValue(""); setCategory(categories[0]); setOpen(false);
  };

  const handleSalarySave = () => {
    const v = parseFloat(salaryInput.replace(",", "."));
    if (!isNaN(v) && v >= 0) { updateSalary(v); setEditingSalary(false); }
  };

  const handleValeSave = () => {
    const v = parseFloat(valeInput.replace(",", "."));
    if (!isNaN(v) && v >= 0) { updateVale(v); setEditingVale(false); }
  };

  const handleAddExtra = () => {
    const v = parseFloat(extraValue.replace(",", "."));
    if (extraName.trim() && !isNaN(v) && v > 0) {
      addIncome({ name: `(extra) ${extraName.trim()}`, value: v, type: "extra", date: new Date().toISOString() });
      setExtraName(""); setExtraValue(""); setExtraOpen(false);
    }
  };

  const handleEditIncomeSave = (id: string) => {
    const v = parseFloat(editingIncomeValue.replace(",", "."));
    if (!isNaN(v) && v > 0) { updateIncome(id, v); setEditingIncomeId(null); }
  };

  const handlePayConfirm = (sources: PaymentSources) => {
    if (payDialog) { markGeneralExpensePaid(payDialog.id, sources); setPayDialog(null); }
  };

  const handleCheckboxChange = (expense: { id: string; name: string; value: number; paid: boolean }) => {
    if (expense.paid) {
      unmarkGeneralExpensePaid(expense.id);
    } else {
      setPayDialog({ id: expense.id, name: expense.name, value: expense.value });
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Gastos</h2>
          <p className="text-muted-foreground text-sm mt-1">Controle seus gastos gerais, renda e vale</p>
        </div>

        {/* Income Section */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-finance-yellow" />
              Renda do Mês — {MONTHS[currentMonth]}
            </h3>
            <Dialog open={extraOpen} onOpenChange={setExtraOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-xs text-finance-cyan hover:text-finance-cyan/80 transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Renda Extra
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Adicionar Renda Extra</DialogTitle></DialogHeader>
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
            <span className="text-sm text-finance-yellow font-medium">Salário (salário limpo)</span>
            {editingSalary ? (
              <div className="flex items-center gap-2">
                <Input className="w-32 h-8 text-sm" type="number" step="0.01" placeholder="Valor limpo" value={salaryInput} onChange={e => setSalaryInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSalarySave()} autoFocus />
                <Button size="sm" variant="ghost" onClick={handleSalarySave} className="h-8 text-xs">OK</Button>
              </div>
            ) : (
              <button onClick={() => { setSalaryInput(salary > 0 ? salary.toString() : ""); setEditingSalary(true); }} className="text-sm font-semibold text-finance-yellow hover:underline">
                {salary > 0 ? `R$ ${salary.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Definir salário limpo"}
              </button>
            )}
          </div>

          {/* Vale */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-finance-green flex items-center gap-1.5 font-medium">
              <Gift className="h-3.5 w-3.5" /> Vale (benefício)
            </span>
            {editingVale ? (
              <div className="flex items-center gap-2">
                <Input className="w-32 h-8 text-sm" type="number" step="0.01" value={valeInput} onChange={e => setValeInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleValeSave()} autoFocus />
                <Button size="sm" variant="ghost" onClick={handleValeSave} className="h-8 text-xs">OK</Button>
              </div>
            ) : (
              <button onClick={() => { setValeInput(vale > 0 ? vale.toString() : ""); setEditingVale(true); }} className="text-sm font-semibold text-finance-green hover:underline">
                {vale > 0 ? `R$ ${vale.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Definir vale"}
              </button>
            )}
          </div>

          {/* Extra incomes */}
          {extraIncomes.map(inc => (
            <div key={inc.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-finance-cyan font-medium">{inc.name}</span>
              <div className="flex items-center gap-2">
                {editingIncomeId === inc.id ? (
                  <>
                    <Input className="w-24 h-7 text-sm" type="number" step="0.01" value={editingIncomeValue} onChange={e => setEditingIncomeValue(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEditIncomeSave(inc.id)} autoFocus />
                    <Button size="sm" variant="ghost" onClick={() => handleEditIncomeSave(inc.id)} className="h-7 text-xs">OK</Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-finance-cyan">+R$ {inc.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    <button onClick={() => { setEditingIncomeId(inc.id); setEditingIncomeValue(inc.value.toString()); }} className="text-muted-foreground hover:text-finance-cyan transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => removeIncome(inc.id)} className="text-muted-foreground hover:text-destructive transition-colors"><span className="text-xs">✕</span></button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Total defined / remaining */}
          <div className="flex items-center justify-between pt-3 mt-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total definido</span>
            <span className="text-sm font-bold text-foreground">R$ {totalDefined.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Sobra (após pagos)</span>
            <span className={cn("text-sm font-bold", totalRemaining >= 0 ? "text-finance-green" : "text-destructive")}>
              R$ {totalRemaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-finance-blue/20">
                <TrendingDown className="h-6 w-6 text-finance-blue" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Gastos — {MONTHS[currentMonth]}</p>
                <p className="text-3xl font-bold text-foreground">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">A pagar: <span className="text-finance-blue font-semibold">R$ {unpaidTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></p>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-finance-blue hover:bg-finance-blue/80 text-white"><Plus className="h-4 w-4 mr-1" /> Adicionar Gasto</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="text-foreground">Novo Gasto</DialogTitle></DialogHeader>
                <div className="flex flex-col gap-4 mt-2">
                  <Input placeholder="Nome do gasto" value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border" />
                  <Input type="number" placeholder="Valor (R$)" value={value} onChange={e => setValue(e.target.value)} className="bg-secondary border-border" />
                  <select value={category} onChange={e => setCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Button onClick={handleAdd} className="bg-finance-blue hover:bg-finance-blue/80 text-white">Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Todos os Gastos Gerais</h3>
          {generalExpenses.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum gasto registrado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...generalExpenses].reverse().map(expense => {
                const d = new Date(expense.date);
                const sourceLabel = expense.paid && expense.paymentSources
                  ? Object.entries(expense.paymentSources).filter(([,v]) => v && v > 0).map(([k]) => k === "salary" ? "Salário" : k === "extra" ? "Extra" : "Vale").join(" + ")
                  : "";
                return (
                  <div key={expense.id} className={cn(
                    "flex items-center justify-between py-3 px-4 rounded-lg border border-border",
                    expense.paid ? "bg-finance-blue/5 opacity-60" : "bg-secondary/50"
                  )}>
                    <div className="flex items-center gap-3">
                      <Checkbox checked={expense.paid} onCheckedChange={() => handleCheckboxChange(expense)} />
                      <div>
                        <p className={cn("text-sm font-medium text-foreground", expense.paid && "line-through")}>{expense.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.category} · {MONTHS[d.getMonth()]} {d.getFullYear()}
                          {sourceLabel && <span className="ml-1 text-finance-green">· Pago com {sourceLabel}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-sm font-semibold", expense.paid ? "text-muted-foreground" : "text-finance-blue")}>-R$ {expense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <button onClick={() => removeGeneralExpense(expense.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
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

export default ExpensesContent;
