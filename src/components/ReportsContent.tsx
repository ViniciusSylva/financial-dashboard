import { FileBarChart } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
  const { getAllMonths, getCardTotalByMonth, getExpensesTotalByMonth, getCardExpensesByMonth, getGeneralExpensesByMonth } = useFinance();
  const months = getAllMonths();

  const chartData = months.map(m => ({
    name: `${MONTHS[m.month]}/${m.year}`,
    cartao: getCardTotalByMonth(m.year, m.month),
    gastos: getExpensesTotalByMonth(m.year, m.month),
  })).reverse();

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
            <p className="text-muted-foreground">Nenhum dado registrado ainda. Adicione gastos no Cartão ou em Gastos.</p>
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
                  <Bar dataKey="cartao" name="Cartão" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" name="Gastos" fill="hsl(330, 85%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Breakdown */}
            {months.map(m => {
              const cardExp = getCardExpensesByMonth(m.year, m.month);
              const genExp = getGeneralExpensesByMonth(m.year, m.month);
              const cardTotal = getCardTotalByMonth(m.year, m.month);
              const genTotal = getExpensesTotalByMonth(m.year, m.month);
              return (
                <div key={`${m.year}-${m.month}`} className="bg-card border border-border rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">{MONTHS_FULL[m.month]} {m.year}</h3>
                    <span className="text-sm font-bold text-finance-pink">
                      Total: R$ {(cardTotal + genTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-finance-blue font-medium mb-2">Cartão — R$ {cardTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      {cardExp.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Sem gastos</p>
                      ) : cardExp.map(e => (
                        <div key={e.id} className="flex justify-between text-xs py-1">
                          <span className="text-muted-foreground">{e.name} ({e.category})</span>
                          <span className="text-foreground">R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-finance-pink font-medium mb-2">Gastos — R$ {genTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      {genExp.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Sem gastos</p>
                      ) : genExp.map(e => (
                        <div key={e.id} className="flex justify-between text-xs py-1">
                          <span className="text-muted-foreground">{e.name} ({e.category})</span>
                          <span className="text-foreground">R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
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
    </div>
  );
};

export default ReportsContent;
