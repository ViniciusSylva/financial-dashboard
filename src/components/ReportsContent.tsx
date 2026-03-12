import { useState } from "react";
import { FileBarChart, Pencil, Trash2, Plus } from "lucide-react";
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
    getAllMonths, getCardTotalByMonth, getExpensesTotalByMonth, getBenefitsTotalByMonth,
    getCardExpensesByMonth, getGeneralExpensesByMonth, getBenefitExpensesByMonth,
    addCardExpense, addGeneralExpense, addBenefitExpense,
    removeCardExpense, removeGeneralExpense, removeBenefitExpense,
    getSalaryByMonth, getIncomeTotalByMonth,
  } = useFinance();

  const months = getAllMonths();

  const [addDialog, setAddDialog] = useState<{ year: number; month: number; type: "card" | "general" | "benefit" } | null>(null);
  const [addName, setAddName] = useState("");
  const [addValue, setAddValue] = useState("");

  const chartData = months.map(m => ({
    name: `${MONTHS[m.month]}/${m.year}`,
    gastos: getExpensesTotalByMonth(m.year, m.month),
    cartao: getCardTotalByMonth(m.year, m.month),
    beneficios: getBenefitsTotalByMonth(m.year, m.month),
  })).reverse();

  const handleAddExpense = () => {
    if (!addDialog || !addName.trim() || !addValue) return;
    const v = parseFloat(addValue);
    if (isNaN(v) || v <= 0) return;
    const date = new Date(addDialog.year, addDialog.month, 15).toISOString();
    const expense = { name: addName.trim(), category: "Outros", value: v, date };

    if (addDialog.type === "card") addCardExpense(expense);
    else if (addDialog.type === "general") addGeneralExpense(expense);
    else addBenefitExpense(expense);

    setAddName("");
    setAddValue("");
    setAddDialog(null);
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Relatórios</h2>
          <p className="text-muted-foreground text-sm mt-1">Visão consolidada de todos os meses</p>
        </div>

        {months.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum dado registrado ainda.</p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Comparativo Mensal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 18%)" />
                  <XAxis dataKey="name" stroke="hsl(240, 5%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(240, 5%, 55%)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="gastos" name="Gastos" fill="hsl(220, 90%, 56%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cartao" name="Cartão" fill="hsl(0, 72%, 56%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="beneficios" name="Benefícios" fill="hsl(160, 84%, 44%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Breakdown */}
            {months.map(m => {
              const cardExp = getCardExpensesByMonth(m.year, m.month);
              const genExp = getGeneralExpensesByMonth(m.year, m.month);
              const benExp = getBenefitExpensesByMonth(m.year, m.month);
              const cardTotal = getCardTotalByMonth(m.year, m.month);
              const genTotal = getExpensesTotalByMonth(m.year, m.month);
              const benTotal = getBenefitsTotalByMonth(m.year, m.month);
              const salary = getSalaryByMonth(m.year, m.month);
              const income = getIncomeTotalByMonth(m.year, m.month);

              return (
                <div key={`${m.year}-${m.month}`} className="bg-card border border-border rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">{MONTHS_FULL[m.month]} {m.year}</h3>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-finance-yellow">Renda: R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <span className="text-destructive font-bold">
                        Total: R$ {(cardTotal + genTotal + benTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Gastos */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-finance-blue font-medium">Gastos — R$ {genTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <button onClick={() => setAddDialog({ year: m.year, month: m.month, type: "general" })} className="text-finance-blue hover:text-finance-blue/70">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {genExp.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Sem gastos</p>
                      ) : genExp.map(e => (
                        <div key={e.id} className="flex justify-between text-xs py-1 group">
                          <span className="text-muted-foreground">{e.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-foreground">R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            <button onClick={() => removeGeneralExpense(e.id)} className="opacity-0 group-hover:opacity-100 text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Cartão */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-destructive font-medium">Cartão — R$ {cardTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <button onClick={() => setAddDialog({ year: m.year, month: m.month, type: "card" })} className="text-destructive hover:text-destructive/70">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {cardExp.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Sem gastos</p>
                      ) : cardExp.map(e => (
                        <div key={e.id} className="flex justify-between text-xs py-1 group">
                          <span className="text-muted-foreground">{e.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-foreground">R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            <button onClick={() => removeCardExpense(e.id)} className="opacity-0 group-hover:opacity-100 text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Benefícios */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-finance-green font-medium">Benefícios — R$ {benTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <button onClick={() => setAddDialog({ year: m.year, month: m.month, type: "benefit" })} className="text-finance-green hover:text-finance-green/70">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {benExp.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Sem gastos</p>
                      ) : benExp.map(e => (
                        <div key={e.id} className="flex justify-between text-xs py-1 group">
                          <span className="text-muted-foreground">{e.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-foreground">R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            <button onClick={() => removeBenefitExpense(e.id)} className="opacity-0 group-hover:opacity-100 text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
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

      {/* Add expense dialog for past months */}
      <Dialog open={!!addDialog} onOpenChange={(o) => !o && setAddDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Adicionar {addDialog?.type === "card" ? "Gasto Cartão" : addDialog?.type === "benefit" ? "Gasto Benefício" : "Gasto Geral"}
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
