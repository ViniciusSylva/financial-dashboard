import { useState } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const categories = ["Alimentação", "Compras", "Assinaturas", "Transporte", "Lazer", "Saúde", "Outros"];

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const CardContent = () => {
  const now = new Date();
  const { addCardExpense, removeCardExpense, getCardExpensesByMonth, getCardTotalByMonth } = useFinance();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [open, setOpen] = useState(false);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const expenses = getCardExpensesByMonth(currentYear, currentMonth);
  const total = getCardTotalByMonth(currentYear, currentMonth);

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
              <div className="p-3 rounded-lg bg-finance-blue/20">
                <CreditCard className="h-6 w-6 text-finance-blue" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Fatura {MONTHS[currentMonth]}</p>
                <p className="text-3xl font-bold text-foreground">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-finance-blue hover:bg-finance-blue/80 text-white">
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
                  <Button onClick={handleAdd} className="bg-finance-blue hover:bg-finance-blue/80 text-white">
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Gastos do Cartão — {MONTHS[currentMonth]}</h3>
          {expenses.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum gasto registrado neste mês.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {expenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{expense.name}</p>
                    <p className="text-xs text-muted-foreground">{expense.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-finance-pink">
                      -R$ {expense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => removeCardExpense(expense.id)} className="text-muted-foreground hover:text-finance-pink transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardContent;
