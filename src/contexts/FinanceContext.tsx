import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Expense {
  id: string;
  name: string;
  category: string;
  value: number;
  date: string; // ISO string
}

export interface Income {
  id: string;
  name: string;
  value: number;
  type: "salary" | "extra";
  date: string;
}

interface FinanceContextType {
  cardExpenses: Expense[];
  generalExpenses: Expense[];
  incomes: Income[];
  addCardExpense: (expense: Omit<Expense, "id">) => void;
  removeCardExpense: (id: string) => void;
  addGeneralExpense: (expense: Omit<Expense, "id">) => void;
  removeGeneralExpense: (id: string) => void;
  addIncome: (income: Omit<Income, "id">) => void;
  removeIncome: (id: string) => void;
  updateSalary: (value: number) => void;
  getSalaryByMonth: (year: number, month: number) => number;
  getExtraIncomeByMonth: (year: number, month: number) => Income[];
  getIncomeTotalByMonth: (year: number, month: number) => number;
  getCardTotalByMonth: (year: number, month: number) => number;
  getExpensesTotalByMonth: (year: number, month: number) => number;
  getCardExpensesByMonth: (year: number, month: number) => Expense[];
  getGeneralExpensesByMonth: (year: number, month: number) => Expense[];
  getAllMonths: () => { year: number; month: number }[];
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const CARD_KEY = "finance_card_expenses";
const GENERAL_KEY = "finance_general_expenses";
const INCOME_KEY = "finance_incomes";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cardExpenses, setCardExpenses] = useState<Expense[]>(() => loadFromStorage(CARD_KEY, []));
  const [generalExpenses, setGeneralExpenses] = useState<Expense[]>(() => loadFromStorage(GENERAL_KEY, []));
  const [incomes, setIncomes] = useState<Income[]>(() => loadFromStorage(INCOME_KEY, []));

  useEffect(() => { localStorage.setItem(CARD_KEY, JSON.stringify(cardExpenses)); }, [cardExpenses]);
  useEffect(() => { localStorage.setItem(GENERAL_KEY, JSON.stringify(generalExpenses)); }, [generalExpenses]);
  useEffect(() => { localStorage.setItem(INCOME_KEY, JSON.stringify(incomes)); }, [incomes]);

  const addCardExpense = useCallback((expense: Omit<Expense, "id">) => {
    setCardExpenses(prev => [...prev, { ...expense, id: crypto.randomUUID() }]);
  }, []);

  const removeCardExpense = useCallback((id: string) => {
    setCardExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const addGeneralExpense = useCallback((expense: Omit<Expense, "id">) => {
    setGeneralExpenses(prev => [...prev, { ...expense, id: crypto.randomUUID() }]);
  }, []);

  const removeGeneralExpense = useCallback((id: string) => {
    setGeneralExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const addIncome = useCallback((income: Omit<Income, "id">) => {
    setIncomes(prev => [...prev, { ...income, id: crypto.randomUUID() }]);
  }, []);

  const removeIncome = useCallback((id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateSalary = useCallback((value: number) => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    setIncomes(prev => {
      const existing = prev.find(i => i.type === "salary" && (() => { const d = new Date(i.date); return `${d.getFullYear()}-${d.getMonth()}`; })() === monthKey);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, value } : i);
      }
      return [...prev, { id: crypto.randomUUID(), name: "Salário", value, type: "salary" as const, date: now.toISOString() }];
    });
  }, []);

  const getSalaryByMonth = useCallback((year: number, month: number) => {
    const s = incomes.find(i => i.type === "salary" && (() => { const d = new Date(i.date); return d.getFullYear() === year && d.getMonth() === month; })());
    return s?.value ?? 0;
  }, [incomes]);

  const getExtraIncomeByMonth = useCallback((year: number, month: number) =>
    incomes.filter(i => i.type === "extra" && (() => { const d = new Date(i.date); return d.getFullYear() === year && d.getMonth() === month; })()), [incomes]);

  const getIncomeTotalByMonth = useCallback((year: number, month: number) => {
    return incomes.filter(i => { const d = new Date(i.date); return d.getFullYear() === year && d.getMonth() === month; }).reduce((sum, i) => sum + i.value, 0);
  }, [incomes]);

  const filterByMonth = (expenses: Expense[], year: number, month: number) =>
    expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

  const getCardTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(cardExpenses, year, month).reduce((sum, e) => sum + e.value, 0), [cardExpenses]);

  const getExpensesTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(generalExpenses, year, month).reduce((sum, e) => sum + e.value, 0), [generalExpenses]);

  const getCardExpensesByMonth = useCallback((year: number, month: number) =>
    filterByMonth(cardExpenses, year, month), [cardExpenses]);

  const getGeneralExpensesByMonth = useCallback((year: number, month: number) =>
    filterByMonth(generalExpenses, year, month), [generalExpenses]);

  const getAllMonths = useCallback(() => {
    const all = [...cardExpenses, ...generalExpenses];
    const set = new Set(all.map(e => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));
    return Array.from(set).map(s => {
      const [y, m] = s.split("-").map(Number);
      return { year: y, month: m };
    }).sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month);
  }, [cardExpenses, generalExpenses]);

  return (
    <FinanceContext.Provider value={{
      cardExpenses, generalExpenses, incomes,
      addCardExpense, removeCardExpense,
      addGeneralExpense, removeGeneralExpense,
      addIncome, removeIncome, updateSalary,
      getSalaryByMonth, getExtraIncomeByMonth, getIncomeTotalByMonth,
      getCardTotalByMonth, getExpensesTotalByMonth,
      getCardExpensesByMonth, getGeneralExpensesByMonth,
      getAllMonths,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};
