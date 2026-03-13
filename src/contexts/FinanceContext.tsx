import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface PaymentSources {
  salary?: number;
  extra?: number;
  vale?: number;
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  value: number;
  date: string;
  paid: boolean;
  paymentSources?: PaymentSources;
}

export interface Income {
  id: string;
  name: string;
  value: number;
  type: "salary" | "extra" | "vale";
  date: string;
}

interface FinanceContextType {
  cardExpenses: Expense[];
  generalExpenses: Expense[];
  incomes: Income[];
  addCardExpense: (expense: Omit<Expense, "id" | "paid" | "paymentSources">) => void;
  removeCardExpense: (id: string) => void;
  markCardExpensePaid: (id: string, sources: PaymentSources) => void;
  unmarkCardExpensePaid: (id: string) => void;
  addGeneralExpense: (expense: Omit<Expense, "id" | "paid" | "paymentSources">) => void;
  removeGeneralExpense: (id: string) => void;
  markGeneralExpensePaid: (id: string, sources: PaymentSources) => void;
  unmarkGeneralExpensePaid: (id: string) => void;
  addIncome: (income: Omit<Income, "id">) => void;
  removeIncome: (id: string) => void;
  updateIncome: (id: string, value: number) => void;
  updateSalary: (value: number) => void;
  updateVale: (value: number) => void;
  getSalaryByMonth: (year: number, month: number) => number;
  getValeByMonth: (year: number, month: number) => number;
  getExtraIncomeByMonth: (year: number, month: number) => Income[];
  getIncomeTotalByMonth: (year: number, month: number) => number;
  getCardTotalByMonth: (year: number, month: number) => number;
  getCardUnpaidTotalByMonth: (year: number, month: number) => number;
  getExpensesTotalByMonth: (year: number, month: number) => number;
  getExpensesUnpaidTotalByMonth: (year: number, month: number) => number;
  getCardExpensesByMonth: (year: number, month: number) => Expense[];
  getGeneralExpensesByMonth: (year: number, month: number) => Expense[];
  getUsedFromSource: (year: number, month: number, source: "salary" | "extra" | "vale") => number;
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

  const addCardExpense = useCallback((expense: Omit<Expense, "id" | "paid" | "paymentSources">) => {
    setCardExpenses(prev => [...prev, { ...expense, id: crypto.randomUUID(), paid: false }]);
  }, []);
  const removeCardExpense = useCallback((id: string) => {
    setCardExpenses(prev => prev.filter(e => e.id !== id));
  }, []);
  const markCardExpensePaid = useCallback((id: string, sources: PaymentSources) => {
    setCardExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: true, paymentSources: sources } : e));
  }, []);
  const unmarkCardExpensePaid = useCallback((id: string) => {
    setCardExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: false, paymentSources: undefined } : e));
  }, []);

  const addGeneralExpense = useCallback((expense: Omit<Expense, "id" | "paid" | "paymentSources">) => {
    setGeneralExpenses(prev => [...prev, { ...expense, id: crypto.randomUUID(), paid: false }]);
  }, []);
  const removeGeneralExpense = useCallback((id: string) => {
    setGeneralExpenses(prev => prev.filter(e => e.id !== id));
  }, []);
  const markGeneralExpensePaid = useCallback((id: string, sources: PaymentSources) => {
    setGeneralExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: true, paymentSources: sources } : e));
  }, []);
  const unmarkGeneralExpensePaid = useCallback((id: string) => {
    setGeneralExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: false, paymentSources: undefined } : e));
  }, []);

  const addIncome = useCallback((income: Omit<Income, "id">) => {
    setIncomes(prev => [...prev, { ...income, id: crypto.randomUUID() }]);
  }, []);
  const removeIncome = useCallback((id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  }, []);
  const updateIncome = useCallback((id: string, value: number) => {
    setIncomes(prev => prev.map(i => i.id === id ? { ...i, value } : i));
  }, []);

  const updateSalary = useCallback((value: number) => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    setIncomes(prev => {
      const existing = prev.find(i => i.type === "salary" && (() => { const d = new Date(i.date); return `${d.getFullYear()}-${d.getMonth()}`; })() === monthKey);
      if (existing) return prev.map(i => i.id === existing.id ? { ...i, value } : i);
      return [...prev, { id: crypto.randomUUID(), name: "Salário (salário limpo)", value, type: "salary" as const, date: now.toISOString() }];
    });
  }, []);

  const updateVale = useCallback((value: number) => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    setIncomes(prev => {
      const existing = prev.find(i => i.type === "vale" && (() => { const d = new Date(i.date); return `${d.getFullYear()}-${d.getMonth()}`; })() === monthKey);
      if (existing) return prev.map(i => i.id === existing.id ? { ...i, value } : i);
      return [...prev, { id: crypto.randomUUID(), name: "Vale", value, type: "vale" as const, date: now.toISOString() }];
    });
  }, []);

  const getSalaryByMonth = useCallback((year: number, month: number) => {
    const s = incomes.find(i => i.type === "salary" && (() => { const d = new Date(i.date); return d.getFullYear() === year && d.getMonth() === month; })());
    return s?.value ?? 0;
  }, [incomes]);

  const getValeByMonth = useCallback((year: number, month: number) => {
    const v = incomes.find(i => i.type === "vale" && (() => { const d = new Date(i.date); return d.getFullYear() === year && d.getMonth() === month; })());
    return v?.value ?? 0;
  }, [incomes]);

  const getExtraIncomeByMonth = useCallback((year: number, month: number) =>
    incomes.filter(i => i.type === "extra" && (() => { const d = new Date(i.date); return d.getFullYear() === year && d.getMonth() === month; })()), [incomes]);

  const getIncomeTotalByMonth = useCallback((year: number, month: number) => {
    return incomes.filter(i => { const d = new Date(i.date); return d.getFullYear() === year && d.getMonth() === month; }).reduce((sum, i) => sum + i.value, 0);
  }, [incomes]);

  const filterByMonth = (expenses: Expense[], year: number, month: number) =>
    expenses.filter(e => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === month; });

  const getCardTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(cardExpenses, year, month).reduce((sum, e) => sum + e.value, 0), [cardExpenses]);
  const getCardUnpaidTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(cardExpenses, year, month).filter(e => !e.paid).reduce((sum, e) => sum + e.value, 0), [cardExpenses]);

  const getExpensesTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(generalExpenses, year, month).reduce((sum, e) => sum + e.value, 0), [generalExpenses]);
  const getExpensesUnpaidTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(generalExpenses, year, month).filter(e => !e.paid).reduce((sum, e) => sum + e.value, 0), [generalExpenses]);

  const getCardExpensesByMonth = useCallback((year: number, month: number) =>
    filterByMonth(cardExpenses, year, month), [cardExpenses]);
  const getGeneralExpensesByMonth = useCallback((year: number, month: number) =>
    filterByMonth(generalExpenses, year, month), [generalExpenses]);

  const getUsedFromSource = useCallback((year: number, month: number, source: "salary" | "extra" | "vale") => {
    const allPaid = [
      ...filterByMonth(cardExpenses, year, month).filter(e => e.paid),
      ...filterByMonth(generalExpenses, year, month).filter(e => e.paid),
    ];
    return allPaid.reduce((sum, e) => sum + (e.paymentSources?.[source] ?? 0), 0);
  }, [cardExpenses, generalExpenses]);

  const getAllMonths = useCallback(() => {
    const all = [...cardExpenses, ...generalExpenses, ...incomes.map(i => ({ date: i.date }))];
    const set = new Set(all.map(e => { const d = new Date(e.date); return `${d.getFullYear()}-${d.getMonth()}`; }));
    return Array.from(set).map(s => {
      const [y, m] = s.split("-").map(Number);
      return { year: y, month: m };
    }).sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month);
  }, [cardExpenses, generalExpenses, incomes]);

  return (
    <FinanceContext.Provider value={{
      cardExpenses, generalExpenses, incomes,
      addCardExpense, removeCardExpense, markCardExpensePaid, unmarkCardExpensePaid,
      addGeneralExpense, removeGeneralExpense, markGeneralExpensePaid, unmarkGeneralExpensePaid,
      addIncome, removeIncome, updateIncome, updateSalary, updateVale,
      getSalaryByMonth, getValeByMonth, getExtraIncomeByMonth, getIncomeTotalByMonth,
      getCardTotalByMonth, getCardUnpaidTotalByMonth,
      getExpensesTotalByMonth, getExpensesUnpaidTotalByMonth,
      getCardExpensesByMonth, getGeneralExpensesByMonth,
      getUsedFromSource, getAllMonths,
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
