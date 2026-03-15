import { LayoutDashboard, CreditCard, TrendingDown, Target, FileBarChart } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const items = [
  { title: "Início", url: "/", icon: LayoutDashboard, color: "text-finance-yellow" },
  { title: "Gastos", url: "/gastos", icon: TrendingDown, color: "text-finance-blue" },
  { title: "Cartão", url: "/cartao", icon: CreditCard, color: "text-destructive" },
  { title: "Metas", url: "/metas", icon: Target, color: "text-finance-yellow" },
  { title: "Relatórios", url: "/relatorios", icon: FileBarChart, color: "text-finance-purple" },
];

const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-border md:hidden">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-muted-foreground transition-colors"
            activeClassName="text-foreground"
          >
            <item.icon className={cn("h-5 w-5", item.color)} />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
