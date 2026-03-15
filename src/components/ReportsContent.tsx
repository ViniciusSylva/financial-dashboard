import { useState } from "react";
import { FileBarChart, Trash2, Plus } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MONTHS_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: R$ {entry.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ReportsContent = () => {
  const {
    getAllMonths, getCardTotalByMonth, getExpensesTotalByMonth,
    getCardExpensesByMonth, getGeneralExpensesByMonth,
    addCardExpense, addGeneralExpense,
    removeCardExpense, removeGeneralExpense,
    getSalaryByMonth, getIncomeTotalByMonth,
  } = useFinance();

  const months = getAllMonths();

  const [addDialog, setAddDialog] = useState<{ year: number; month: number; type: "card" | "general" } | null>(null);
  const [addName, setAddName] = useState("");
  const [addValue, setAddValue] = useState("");

  const chartData = months.map(m => ({
    name: `${MONTHS[m.month]}/${m.year}`,
    gastos: getExpensesTotalByMonth(m.year, m.month),
    cartao: getCardTotalByMonth(m.year, m.month),
  })).reverse();

  const handleAddExpense = () => {
    if (!addDialog || !addName.trim() || !addValue) return;
    const v = parseFloat(addValue);
    if (isNaN(v) || v <= 0) return;
    const date = new Date(addDialog.year, addDialog.month, 15).toISOString();
    const expense = { name: addName.trim(), category: "Outros", value: v, date };
    if (addDialog.type === "card") addCardExpense(expense);
    else addGeneralExpense(expense);
    setAddName(""); setAddValue(""); setAddDialog(null);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Relatórios</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Visão consolidada de todos os meses</p>
        </div>

        {months.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center">
            <FileBarChart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum dado registrado ainda.</p>
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Comparativo Mensal</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 18%)" />
                  <XAxis dataKey="name" stroke="hsl(240, 5%, 55%)" fontSize={10} />
                  <YAxis stroke="hsl(240, 5%, 55%)" fontSize={10} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="gastos" name="Gastos" fill="hsl(220, 90%, 56%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cartao" name="Cartão" fill="hsl(0, 72%, 56%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {months.map(m => {
              const cardExp = getCardExpensesByMonth(m.year, m.month);
              const genExp = getGeneralExpensesByMonth(m.year, m.month);
              const cardTotal = getCardTotalByMonth(m.year, m.month);
              const genTotal = getExpensesTotalByMonth(m.year, m.month);
              const income = getIncomeTotalByMonth(m.year, m.month);

              return (
                <div key={`${m.year}-${m.month}`} className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground">{MONTHS_FULL[m.month]} {m.year}</h3>
                    <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
                      <span className="text-finance-yellow">Renda: R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <span className="text-destructive font-bold">Total: R$ {(cardTotal + genTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-finance-blue font-medium">Gastos — R$ {genTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <button onClick={() => setAddDialog({ year: m.year, month: m.month, type: "general" })} className="text-finance-blue hover:text-finance-blue/70"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      {genExp.length === 0 ? <p className="text-xs text-muted-foreground">Sem gastos</p> : genExp.map(e => (
                        <div key={e.id} className="flex justify-between text-xs py-1 group">
                          <span className="text-muted-foreground truncate mr-2">{e.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-foreground">R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            <button onClick={() => removeGeneralExpense(e.id)} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-destructive font-medium">Cartão — R$ {cardTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <button onClick={() => setAddDialog({ year: m.year, month: m.month, type: "card" })} className="text-destructive hover:text-destructive/70"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      {cardExp.length === 0 ? <p className="text-xs text-muted-foreground">Sem gastos</p> : cardExp.map(e => (
                        <div key={e.id} className="flex justify-between text-xs py-1 group">
                          <span className="text-muted-foreground truncate mr-2">{e.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-foreground">R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            <button onClick={() => removeCardExpense(e.id)} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <Dialog open={!!addDialog} onOpenChange={(o) => !o && setAddDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Adicionar {addDialog?.type === "card" ? "Gasto Cartão" : "Gasto Geral"}
              {addDialog && ` — ${MONTHS_FULL[addDialog.month]} ${addDialog.year}`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <Input placeholder="Nome" value={addName} onChange={e => setAddName(e.target.value)} className="bg-secondary border-border" />
            <Input type="number" placeholder="Valor (R$)" value={addValue} onChange={e => setAddValue(e.target.value)} className="bg-secondary border-border" />
            <Button onClick={handleAddExpense}>Adicionar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsContent;
