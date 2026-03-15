import { useState, useEffect } from "react";
import { Target, Plus, Trash2, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Define interfaces for goal suggestions and goals
interface GoalSuggestion { id: string; text: string; timestamp: string; }
interface Goal { id: string; title: string; notes: string; suggestions: GoalSuggestion[]; createdAt: string; }

// Local storage key for goals
const GOALS_KEY = "finance_goals";

// Function to load goals from local storage
function loadGoals(): Goal[] {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Function to save goals to local storage
function saveGoals(goals: Goal[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

// Function to generate goal suggestions based on the goal title
function generateSuggestions(title: string): string[] {
  const lower = title.toLowerCase();
  const tips: string[] = [];

  if (lower.includes("emergência") || lower.includes("reserva") || lower.includes("emergencia")) {
    tips.push(
      "Defina uma meta de 3 a 6 meses de despesas fixas como reserva de emergência.",
      "Automatize uma transferência mensal para uma conta separada assim que receber o salário.",
      "Comece guardando pelo menos 10% da renda mensal e aumente gradativamente.",
      "Evite usar a reserva para compras não essenciais."
    );
  }

  if (lower.includes("economizar") || lower.includes("poupar") || lower.includes("guardar") || lower.includes("economia")) {
    tips.push(
      "Revise assinaturas e serviços recorrentes.",
      "Adote a regra 50-30-20.",
      "Substitua refeições fora por marmitas pelo menos 3x por semana.",
      "Use o método do envelope digital."
    );
  }

  if (lower.includes("dívida") || lower.includes("divida") || lower.includes("pagar") || lower.includes("quitar")) {
    tips.push(
      "Liste todas as dívidas por taxa de juros e priorize as mais caras.",
      "Negocie com credores.",
      "Evite contrair novas dívidas.",
      "Considere consolidar dívidas."
    );
  }

  if (lower.includes("investir") || lower.includes("investimento") || lower.includes("rendimento") || lower.includes("aplicar")) {
    tips.push(
      "Comece com renda fixa (CDB, Tesouro Direto).",
      "Nunca invista dinheiro que pode precisar em menos de 6 meses.",
      "Diversifique seus investimentos.",
      "Estude sobre juros compostos."
    );
  }

  if (lower.includes("comprar") || lower.includes("carro") || lower.includes("casa") || lower.includes("viagem") || lower.includes("viajar")) {
    tips.push(
      "Defina o valor total e divida em parcelas mensais.",
      "Crie uma conta separada para esse objetivo.",
      "Pesquise e compare preços.",
      "Considere comprar à vista com desconto."
    );
  }

  if (lower.includes("salário") || lower.includes("salario") || lower.includes("renda") || lower.includes("ganhar mais")) {
    tips.push(
      "Invista em qualificação.",
      "Considere fontes de renda extra.",
      "Negocie seu salário com dados de mercado.",
      "Automatize tarefas para liberar tempo."
    );
  }

  if (tips.length === 0) {
    tips.push(
      "Defina um valor específico e um prazo realista.",
      "Divida a meta em etapas menores.",
      "Acompanhe o progresso semanalmente.",
      "Corte pelo menos um gasto supérfluo por mês."
    );
  }

  return tips;
}

const GoalsContent = () => {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  useEffect(() => { saveGoals(goals); }, [goals]);

  const handleAddGoal = () => {
    if (!newTitle.trim()) return;
    const suggestions = generateSuggestions(newTitle).map((text) => ({ id: crypto.randomUUID(), text, timestamp: new Date().toISOString() }));
    const goal: Goal = { id: crypto.randomUUID(), title: newTitle.trim(), notes: newNotes.trim(), suggestions, createdAt: new Date().toISOString() };
    setGoals((prev) => [goal, ...prev]);
    setNewTitle(""); setNewNotes(""); setDialogOpen(false); setExpandedGoal(goal.id);
  };

  const handleRemoveGoal = (id: string) => { setGoals((prev) => prev.filter((g) => g.id !== id)); if (expandedGoal === id) setExpandedGoal(null); };

  const handleRegenerateSuggestions = (goalId: string) => {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== goalId) return g;
      const newSugs = generateSuggestions(g.title).map((text) => ({ id: crypto.randomUUID(), text, timestamp: new Date().toISOString() }));
      return { ...g, suggestions: [...g.suggestions, ...newSugs] };
    }));
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Metas</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">Defina objetivos e receba sugestões</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova Meta</span><span className="sm:hidden">Nova</span></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Meta</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Ex: Juntar R$5.000 para emergência" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddGoal()} />
                <Textarea placeholder="Observações (opcional)" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="min-h-[60px]" />
                <Button onClick={handleAddGoal} className="w-full" disabled={!newTitle.trim()}><Sparkles className="h-4 w-4 mr-1.5" /> Criar e gerar sugestões</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {goals.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center">
            <Target className="h-10 w-10 text-finance-yellow mx-auto mb-3 opacity-60" />
            <p className="text-muted-foreground text-sm">Nenhuma meta criada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {goals.map((goal) => {
              const isExpanded = expandedGoal === goal.id;
              return (
                <div key={goal.id} className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/20">
                  <button onClick={() => setExpandedGoal(isExpanded ? null : goal.id)} className="w-full flex items-center gap-2 sm:gap-3 p-4 sm:p-5 text-left">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-finance-yellow shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{goal.title}</p>
                      {goal.notes && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{goal.notes}</p>}
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground/60 shrink-0">{new Date(goal.createdAt).toLocaleDateString("pt-BR")}</span>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-border pt-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-finance-cyan" /> Sugestões
                        </h4>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleRegenerateSuggestions(goal.id)} className="text-xs text-finance-cyan hover:text-finance-cyan/80 transition-colors">+ Mais</button>
                          <button onClick={() => handleRemoveGoal(goal.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remover</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {goal.suggestions.map((sug, idx) => (
                          <div key={sug.id} className="flex gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm bg-secondary/50 text-foreground">
                            <span className="text-finance-cyan font-bold text-xs mt-0.5 shrink-0">{idx + 1}.</span>
                            <span className="leading-relaxed">{sug.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsContent;
