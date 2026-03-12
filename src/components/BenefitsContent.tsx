import { useState } from "react";
import { Gift, Plus, Trash2 } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categories = ["Alimentação", "Refeição", "Transporte", "Saúde", "Cultura", "Outros"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const BenefitsContent = () => {
  const now = new Date();
  const {
    benefitExpenses, benefitTotal, setBenefitTotal,
    addBenefitExpense, removeBenefitExpense, toggleBenefitExpensePaid,
    getBenefitsTotalByMonth,
  } = useFinance();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [open, setOpen] = useState(false);

  const [editingTotal, setEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState(benefitTotal > 0 ? benefitTotal.toString() : "");

  const monthTotal = getBenefitsTotalByMonth(currentYear, currentMonth);
  const remaining = benefitTotal - monthTotal;

  const handleAdd = () => {
    const v = parseFloat(value);
    if (!name.trim() || !value || isNaN(v) || v <= 0) return;

    if (monthTotal + v > benefitTotal) {
      toast.error("Esse gasto ultrapassa o limite de benefícios!");
      return;
    }

    addBenefitExpense({
      name: name.trim(),
      category,
      value: v,
      date: new Date().toISOString(),
    });
    setName("");
    setValue("");
    setCategory(categories[0]);
    setOpen(false);
  };

  const handleSaveTotal = () => {
    const v = parseFloat(totalInput.replace(",", "."));
    if (!isNaN(v) && v >= 0) {
      setBenefitTotal(v);
      setEditingTotal(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Benefícios</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seus benefícios (VR, VA, etc.)</p>
        </div>

        {/* Benefit Total */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Gift className="h-4 w-4 text-finance-green" />
              Total de Benefícios
            </h3>
            {editingTotal ? (
              <div className="flex items-center gap-2">
                <Input
                  className="w-32 h-8 text-sm"
                  type="number" step="0.01"
                  value={totalInput}
                  onChange={e => setTotalInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSaveTotal()}
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={handleSaveTotal} className="h-8 text-xs">OK</Button>
              </div>
            ) : (
              <button
                onClick={() => { setTotalInput(benefitTotal > 0 ? benefitTotal.toString() : ""); setEditingTotal(true); }}
                className="text-sm font-semibold text-finance-green hover:underline"
              >
                {benefitTotal > 0 ? `R$ ${benefitTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Definir valor"}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Restante em {MONTHS[currentMonth]}</span>
            <span className={cn("text-sm font-bold", remaining >= 0 ? "text-finance-green" : "text-destructive")}>
              R$ {remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Add + Total */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-finance-green/20">
                <Gift className="h-6 w-6 text-finance-green" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Gastos Benefícios — {MONTHS[currentMonth]}</p>
                <p className="text-3xl font-bold text-foreground">
                  R$ {monthTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-finance-green hover:bg-finance-green/80 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Gasto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Novo Gasto de Benefício</DialogTitle>
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
                  <Button onClick={handleAdd} className="bg-finance-green hover:bg-finance-green/80 text-white">
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Todos os Gastos de Benefícios</h3>
          {benefitExpenses.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum gasto registrado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...benefitExpenses].reverse().map(expense => {
                const d = new Date(expense.date);
                return (
                  <div key={expense.id} className={cn(
                    "flex items-center justify-between py-3 px-4 rounded-lg border border-border",
                    expense.paid ? "bg-finance-green/5 opacity-60" : "bg-secondary/50"
                  )}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={expense.paid}
                        onCheckedChange={() => toggleBenefitExpensePaid(expense.id)}
                      />
                      <div>
                        <p className={cn("text-sm font-medium text-foreground", expense.paid && "line-through")}>{expense.name}</p>
                        <p className="text-xs text-muted-foreground">{expense.category} · {MONTHS[d.getMonth()]} {d.getFullYear()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-sm font-semibold", expense.paid ? "text-muted-foreground" : "text-finance-green")}>
                        -R$ {expense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <button onClick={() => removeBenefitExpense(expense.id)} className="text-muted-foreground hover:text-destructive transition-colors">
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

export default BenefitsContent;
