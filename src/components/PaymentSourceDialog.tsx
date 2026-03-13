import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentSources } from "@/contexts/FinanceContext";

interface Props {
  open: boolean;
  onClose: () => void;
  expenseValue: number;
  expenseName: string;
  onConfirm: (sources: PaymentSources) => void;
  availableSalary: number;
  availableExtra: number;
  availableVale: number;
}

const PaymentSourceDialog = ({ open, onClose, expenseValue, expenseName, onConfirm, availableSalary, availableExtra, availableVale }: Props) => {
  const [useSalary, setUseSalary] = useState(true);
  const [useExtra, setUseExtra] = useState(false);
  const [useVale, setUseVale] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState(expenseValue.toString());
  const [extraAmount, setExtraAmount] = useState("0");
  const [valeAmount, setValeAmount] = useState("0");

  const handleConfirm = () => {
    const sources: PaymentSources = {};
    if (useSalary) sources.salary = parseFloat(salaryAmount) || 0;
    if (useExtra) sources.extra = parseFloat(extraAmount) || 0;
    if (useVale) sources.vale = parseFloat(valeAmount) || 0;

    const total = (sources.salary ?? 0) + (sources.extra ?? 0) + (sources.vale ?? 0);
    if (Math.abs(total - expenseValue) > 0.01) return; // must match expense value

    onConfirm(sources);
  };

  const selectedCount = [useSalary, useExtra, useVale].filter(Boolean).length;

  // Auto-fill when only one source selected
  const handleToggle = (source: "salary" | "extra" | "vale", checked: boolean) => {
    const newState = { salary: useSalary, extra: useExtra, vale: useVale, [source]: checked };
    if (source === "salary") setUseSalary(checked);
    if (source === "extra") setUseExtra(checked);
    if (source === "vale") setUseVale(checked);

    const active = Object.entries(newState).filter(([, v]) => v);
    if (active.length === 1) {
      const key = active[0][0];
      if (key === "salary") setSalaryAmount(expenseValue.toString());
      if (key === "extra") setExtraAmount(expenseValue.toString());
      if (key === "vale") setValeAmount(expenseValue.toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground text-sm">
            Pagar: {expenseName} — R$ {expenseValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">Selecione a origem do pagamento:</p>

        <div className="space-y-3 mt-2">
          {/* Salary */}
          <div className="flex items-center gap-3">
            <Checkbox checked={useSalary} onCheckedChange={c => handleToggle("salary", !!c)} />
            <span className="text-sm text-finance-yellow font-medium flex-1">Salário (disponível: R$ {availableSalary.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})</span>
            {useSalary && selectedCount > 1 && (
              <Input className="w-24 h-7 text-xs" type="number" step="0.01" value={salaryAmount} onChange={e => setSalaryAmount(e.target.value)} />
            )}
          </div>

          {/* Extra */}
          <div className="flex items-center gap-3">
            <Checkbox checked={useExtra} onCheckedChange={c => handleToggle("extra", !!c)} />
            <span className="text-sm text-finance-cyan font-medium flex-1">Extra (disponível: R$ {availableExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})</span>
            {useExtra && selectedCount > 1 && (
              <Input className="w-24 h-7 text-xs" type="number" step="0.01" value={extraAmount} onChange={e => setExtraAmount(e.target.value)} />
            )}
          </div>

          {/* Vale */}
          <div className="flex items-center gap-3">
            <Checkbox checked={useVale} onCheckedChange={c => handleToggle("vale", !!c)} />
            <span className="text-sm text-finance-green font-medium flex-1">Vale (disponível: R$ {availableVale.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})</span>
            {useVale && selectedCount > 1 && (
              <Input className="w-24 h-7 text-xs" type="number" step="0.01" value={valeAmount} onChange={e => setValeAmount(e.target.value)} />
            )}
          </div>
        </div>

        <Button onClick={handleConfirm} className="w-full mt-2">Confirmar Pagamento</Button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSourceDialog;
