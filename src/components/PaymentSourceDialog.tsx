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
  const [error, setError] = useState("");

  const handleConfirm = () => {
    setError("");
    const sources: PaymentSources = {};
    if (useSalary) sources.salary = parseFloat(salaryAmount) || 0;
    if (useExtra) sources.extra = parseFloat(extraAmount) || 0;
    if (useVale) sources.vale = parseFloat(valeAmount) || 0;

    const total = (sources.salary ?? 0) + (sources.extra ?? 0) + (sources.vale ?? 0);
    
    if (![useSalary, useExtra, useVale].some(Boolean)) {
      setError("Selecione pelo menos uma fonte de pagamento.");
      return;
    }

    if (total <= 0) {
      setError("O valor total deve ser maior que zero.");
      return;
    }

    const diff = total - expenseValue;
    if (Math.abs(diff) > 0.01) {
      setError(
        diff > 0
          ? `O valor informado excede o gasto em R$ ${diff.toFixed(2)}. Ajuste os valores para totalizar R$ ${expenseValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`
          : `Faltam R$ ${Math.abs(diff).toFixed(2)} para cobrir o gasto. O total deve ser R$ ${expenseValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`
      );
      return;
    }

    if ((sources.salary ?? 0) > availableSalary + 0.01) {
      setError(`Saldo insuficiente no Salário. Disponível: R$ ${availableSalary.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
      return;
    }
    if ((sources.extra ?? 0) > availableExtra + 0.01) {
      setError(`Saldo insuficiente no Extra. Disponível: R$ ${availableExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
      return;
    }
    if ((sources.vale ?? 0) > availableVale + 0.01) {
      setError(`Saldo insuficiente no Vale. Disponível: R$ ${availableVale.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
      return;
    }

    onConfirm(sources);
  };

  const selectedCount = [useSalary, useExtra, useVale].filter(Boolean).length;

  const handleToggle = (source: "salary" | "extra" | "vale", checked: boolean) => {
    setError("");
    const newState = { salary: useSalary, extra: useExtra, vale: useVale, [source]: checked };
    if (source === "salary") setUseSalary(checked);
    if (source === "extra") setUseExtra(checked);
    if (source === "vale") setUseVale(checked);

    const active = Object.entries(newState).filter(([, v]) => v);
    if (active.length === 1) {
      const key = active[0][0];
      if (key === "salary") { setSalaryAmount(expenseValue.toString()); setExtraAmount("0"); setValeAmount("0"); }
      if (key === "extra") { setExtraAmount(expenseValue.toString()); setSalaryAmount("0"); setValeAmount("0"); }
      if (key === "vale") { setValeAmount(expenseValue.toString()); setSalaryAmount("0"); setExtraAmount("0"); }
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
          <div className="flex items-center gap-3">
            <Checkbox checked={useSalary} onCheckedChange={c => handleToggle("salary", !!c)} />
            <span className="text-sm text-finance-yellow font-medium flex-1">Salário (disponível: R$ {availableSalary.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})</span>
            {useSalary && selectedCount > 1 && (
              <Input className="w-24 h-7 text-xs" type="number" step="0.01" value={salaryAmount} onChange={e => { setSalaryAmount(e.target.value); setError(""); }} />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Checkbox checked={useExtra} onCheckedChange={c => handleToggle("extra", !!c)} />
            <span className="text-sm text-finance-cyan font-medium flex-1">Extra (disponível: R$ {availableExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})</span>
            {useExtra && selectedCount > 1 && (
              <Input className="w-24 h-7 text-xs" type="number" step="0.01" value={extraAmount} onChange={e => { setExtraAmount(e.target.value); setError(""); }} />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Checkbox checked={useVale} onCheckedChange={c => handleToggle("vale", !!c)} />
            <span className="text-sm text-finance-green font-medium flex-1">Vale (disponível: R$ {availableVale.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})</span>
            {useVale && selectedCount > 1 && (
              <Input className="w-24 h-7 text-xs" type="number" step="0.01" value={valeAmount} onChange={e => { setValeAmount(e.target.value); setError(""); }} />
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mt-2">{error}</p>
        )}

        <Button onClick={handleConfirm} className="w-full mt-2">Confirmar Pagamento</Button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSourceDialog;
