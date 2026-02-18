import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { name: "Jan", receita: 4200, gasto: 2800 },
  { name: "Fev", receita: 3800, gasto: 3200 },
  { name: "Mar", receita: 5100, gasto: 2900 },
  { name: "Abr", receita: 4600, gasto: 3500 },
  { name: "Mai", receita: 5400, gasto: 3100 },
  { name: "Jun", receita: 4900, gasto: 2700 },
];

const summaryCards = [
  {
    title: "Saldo Total",
    value: "R$ 24.580,00",
    change: "+12,5%",
    positive: true,
    icon: Wallet,
    colorClass: "bg-finance-green/10 text-finance-green border-finance-green/20",
    iconBg: "bg-finance-green/20",
  },
  {
    title: "Receitas",
    value: "R$ 5.400,00",
    change: "+8,2%",
    positive: true,
    icon: ArrowUpRight,
    colorClass: "bg-finance-blue/10 text-finance-blue border-finance-blue/20",
    iconBg: "bg-finance-blue/20",
  },
  {
    title: "Despesas",
    value: "R$ 3.100,00",
    change: "-4,1%",
    positive: false,
    icon: ArrowDownRight,
    colorClass: "bg-finance-pink/10 text-finance-pink border-finance-pink/20",
    iconBg: "bg-finance-pink/20",
  },
  {
    title: "Economias",
    value: "R$ 2.300,00",
    change: "+22,3%",
    positive: true,
    icon: PiggyBank,
    colorClass: "bg-finance-yellow/10 text-finance-yellow border-finance-yellow/20",
    iconBg: "bg-finance-yellow/20",
  },
];

const recentTransactions = [
  { name: "Netflix", category: "Entretenimento", value: "-R$ 39,90", color: "text-finance-pink" },
  { name: "Salário", category: "Receita", value: "+R$ 5.400,00", color: "text-finance-green" },
  { name: "Supermercado", category: "Alimentação", value: "-R$ 287,50", color: "text-finance-pink" },
  { name: "Freelance", category: "Receita", value: "+R$ 1.200,00", color: "text-finance-green" },
  { name: "Uber", category: "Transporte", value: "-R$ 45,00", color: "text-finance-pink" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: R$ {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardContent = () => {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Visão geral das suas finanças</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className={`text-xs mt-1 font-medium ${card.positive ? "text-finance-green" : "text-finance-pink"}`}>
                {card.change} este mês
              </p>
            </div>
          ))}
        </div>

        {/* Chart + Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Receitas vs Despesas</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 44%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 44%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(330, 85%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(330, 85%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 18%)" />
                <XAxis dataKey="name" stroke="hsl(240, 5%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(240, 5%, 55%)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="receita"
                  name="Receita"
                  stroke="hsl(160, 84%, 44%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReceita)"
                />
                <Area
                  type="monotone"
                  dataKey="gasto"
                  name="Gasto"
                  stroke="hsl(330, 85%, 60%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGasto)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Transações Recentes</h3>
            <div className="flex flex-col gap-3">
              {recentTransactions.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">{tx.category}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.color}`}>{tx.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
