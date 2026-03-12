import { useState } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const categories = ["Alimentação", "Compras", "Assinaturas", "Transporte", "Lazer", "Saúde", "Outros"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const CardContent = () => {
  const now = new Date();
  const {
    cardExpenses, addCardExpense, removeCardExpense, toggleCardExpensePaid,
    getCardTotalByMonth, getCardUnpaidTotalByMonth, getCardExpensesByMonth,
  } = useFinance();

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [open, setOpen] = useState(false);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const total = getCardTotalByMonth(currentYear, currentMonth);
  const unpaidTotal = getCardUnpaidTotalByMonth(currentYear, currentMonth);

  const handleAdd = () => {
    if (!name.trim() || !value) return;
    addCardExpense({
      name: name.trim(),
      category,
      value: parseFloat(value),
      date: new Date().toISOString(),
    });
    setName("");
    setValue("");
    setCategory(categories[0]);
    setOpen(false);
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Cartão</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie os gastos do seu cartão de crédito</p>
        </div>

        {/* Fatura Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/20">
                <CreditCard className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Fatura {MONTHS[currentMonth]}</p>
                <p className="text-3xl font-bold text-foreground">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">
                  A pagar: <span className="text-destructive font-semibold">R$ {unpaidTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </p>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-destructive hover:bg-destructive/80 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Gasto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Novo Gasto no Cartão</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-2">
                  <Input placeholder="Nome do gasto" value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border" />
                  <Input type="number" placeholder="Valor (R$)" value={value} onChange={e => setValue(e.target.value)} className="bg-secondary border-border" />
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Button onClick={handleAdd} className="bg-destructive hover:bg-destructive/80 text-white">
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Todos os Gastos do Cartão</h3>
          {cardExpenses.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum gasto registrado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...cardExpenses].reverse().map(expense => {
                const d = new Date(expense.date);
                return (
                  <div key={expense.id} className={cn(
                    "flex items-center justify-between py-3 px-4 rounded-lg border border-border",
                    expense.paid ? "bg-destructive/5 opacity-60" : "bg-secondary/50"
                  )}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={expense.paid}
                        onCheckedChange={() => toggleCardExpensePaid(expense.id)}
                      />
                      <div>
                        <p className={cn("text-sm font-medium text-foreground", expense.paid && "line-through")}>{expense.name}</p>
                        <p className="text-xs text-muted-foreground">{expense.category} · {MONTHS[d.getMonth()]} {d.getFullYear()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-sm font-semibold", expense.paid ? "text-muted-foreground" : "text-destructive")}>
                        -R$ {expense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <button onClick={() => removeCardExpense(expense.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardContent;
