import { ArrowDownRight, CreditCard, Wallet, TrendingDown } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const DashboardContent = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const { getCardTotalByMonth, getExpensesTotalByMonth, getCardExpensesByMonth, getGeneralExpensesByMonth } = useFinance();

  const cardTotal = getCardTotalByMonth(currentYear, currentMonth);
  const expensesTotal = getExpensesTotalByMonth(currentYear, currentMonth);
  const totalGastos = cardTotal + expensesTotal;

  const cardExpenses = getCardExpensesByMonth(currentYear, currentMonth);
  const generalExpenses = getGeneralExpensesByMonth(currentYear, currentMonth);

  // Combine recent transactions (last 5)
  const allExpenses = [
    ...cardExpenses.map(e => ({ ...e, source: "Cartão" })),
    ...generalExpenses.map(e => ({ ...e, source: "Gasto" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const summaryCards = [
    {
      title: "Total do Mês",
      value: totalGastos,
      icon: Wallet,
      colorClass: "bg-finance-green/10 text-finance-green border-finance-green/20",
      iconBg: "bg-finance-green/20",
    },
    {
      title: "Fatura Cartão",
      value: cardTotal,
      icon: CreditCard,
      colorClass: "bg-finance-blue/10 text-finance-blue border-finance-blue/20",
      iconBg: "bg-finance-blue/20",
    },
    {
      title: "Gastos Gerais",
      value: expensesTotal,
      icon: TrendingDown,
      colorClass: "bg-finance-pink/10 text-finance-pink border-finance-pink/20",
      iconBg: "bg-finance-pink/20",
    },
  ];

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="bg-card border border-border rounded-xl p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
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
              Nenhuma transação neste mês. Adicione gastos no Cartão ou em Gastos.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {allExpenses.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
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
    </div>
  );
};

export default DashboardContent;
