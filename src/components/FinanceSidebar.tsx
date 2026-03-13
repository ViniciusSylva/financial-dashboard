import { LayoutDashboard, CreditCard, TrendingDown, Target, FileBarChart } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, color: "text-finance-yellow" },
  { title: "Gastos", url: "/gastos", icon: TrendingDown, color: "text-finance-blue" },
  { title: "Cartão", url: "/cartao", icon: CreditCard, color: "text-destructive" },
  { title: "Metas", url: "/metas", icon: Target, color: "text-finance-yellow" },
  { title: "Relatórios", url: "/relatorios", icon: FileBarChart, color: "text-finance-purple" },
];

const FinanceSidebar = () => {
  return (
    <aside className="w-56 min-h-screen bg-sidebar border-r border-border flex flex-col py-6 px-3">
      <div className="mb-10 px-3">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          <span className="text-primary">Fin</span>ance
        </h1>
      </div>
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground group"
            activeClassName="bg-secondary text-foreground"
          >
            <item.icon className={`h-5 w-5 ${item.color} transition-transform duration-200 group-hover:scale-110`} />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default FinanceSidebar;
