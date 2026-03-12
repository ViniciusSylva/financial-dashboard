import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Expense {
  id: string;
  name: string;
  category: string;
  value: number;
  date: string;
  paid: boolean;
}

export interface Income {
  id: string;
  name: string;
  value: number;
  type: "salary" | "extra";
  date: string;
}

export interface BenefitExpense {
  id: string;
  name: string;
  category: string;
  value: number;
  date: string;
  paid: boolean;
}

interface FinanceContextType {
  cardExpenses: Expense[];
  generalExpenses: Expense[];
  benefitExpenses: BenefitExpense[];
  incomes: Income[];
  benefitTotal: number;
  setBenefitTotal: (v: number) => void;
  addCardExpense: (expense: Omit<Expense, "id" | "paid">) => void;
  removeCardExpense: (id: string) => void;
  toggleCardExpensePaid: (id: string) => void;
  addGeneralExpense: (expense: Omit<Expense, "id" | "paid">) => void;
  removeGeneralExpense: (id: string) => void;
  toggleGeneralExpensePaid: (id: string) => void;
  addBenefitExpense: (expense: Omit<BenefitExpense, "id" | "paid">) => void;
  removeBenefitExpense: (id: string) => void;
  toggleBenefitExpensePaid: (id: string) => void;
  addIncome: (income: Omit<Income, "id">) => void;
  removeIncome: (id: string) => void;
  updateIncome: (id: string, value: number) => void;
  updateSalary: (value: number) => void;
  getSalaryByMonth: (year: number, month: number) => number;
  getExtraIncomeByMonth: (year: number, month: number) => Income[];
  getIncomeTotalByMonth: (year: number, month: number) => number;
  getCardTotalByMonth: (year: number, month: number) => number;
  getCardUnpaidTotalByMonth: (year: number, month: number) => number;
  getExpensesTotalByMonth: (year: number, month: number) => number;
  getExpensesUnpaidTotalByMonth: (year: number, month: number) => number;
  getBenefitsTotalByMonth: (year: number, month: number) => number;
  getBenefitsUnpaidTotalByMonth: (year: number, month: number) => number;
  getCardExpensesByMonth: (year: number, month: number) => Expense[];
  getGeneralExpensesByMonth: (year: number, month: number) => Expense[];
  getBenefitExpensesByMonth: (year: number, month: number) => BenefitExpense[];
  getAllMonths: () => { year: number; month: number }[];
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const CARD_KEY = "finance_card_expenses";
const GENERAL_KEY = "finance_general_expenses";
const BENEFIT_KEY = "finance_benefit_expenses";
const INCOME_KEY = "finance_incomes";
const BENEFIT_TOTAL_KEY = "finance_benefit_total";

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
  const [benefitExpenses, setBenefitExpenses] = useState<BenefitExpense[]>(() => loadFromStorage(BENEFIT_KEY, []));
  const [incomes, setIncomes] = useState<Income[]>(() => loadFromStorage(INCOME_KEY, []));
  const [benefitTotal, setBenefitTotalState] = useState<number>(() => loadFromStorage(BENEFIT_TOTAL_KEY, 0));

  useEffect(() => { localStorage.setItem(CARD_KEY, JSON.stringify(cardExpenses)); }, [cardExpenses]);
  useEffect(() => { localStorage.setItem(GENERAL_KEY, JSON.stringify(generalExpenses)); }, [generalExpenses]);
  useEffect(() => { localStorage.setItem(BENEFIT_KEY, JSON.stringify(benefitExpenses)); }, [benefitExpenses]);
  useEffect(() => { localStorage.setItem(INCOME_KEY, JSON.stringify(incomes)); }, [incomes]);
  useEffect(() => { localStorage.setItem(BENEFIT_TOTAL_KEY, JSON.stringify(benefitTotal)); }, [benefitTotal]);

  const setBenefitTotal = useCallback((v: number) => setBenefitTotalState(v), []);

  const addCardExpense = useCallback((expense: Omit<Expense, "id" | "paid">) => {
    setCardExpenses(prev => [...prev, { ...expense, id: crypto.randomUUID(), paid: false }]);
  }, []);
  const removeCardExpense = useCallback((id: string) => {
    setCardExpenses(prev => prev.filter(e => e.id !== id));
  }, []);
  const toggleCardExpensePaid = useCallback((id: string) => {
    setCardExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e));
  }, []);

  const addGeneralExpense = useCallback((expense: Omit<Expense, "id" | "paid">) => {
    setGeneralExpenses(prev => [...prev, { ...expense, id: crypto.randomUUID(), paid: false }]);
  }, []);
  const removeGeneralExpense = useCallback((id: string) => {
    setGeneralExpenses(prev => prev.filter(e => e.id !== id));
  }, []);
  const toggleGeneralExpensePaid = useCallback((id: string) => {
    setGeneralExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e));
  }, []);

  const addBenefitExpense = useCallback((expense: Omit<BenefitExpense, "id" | "paid">) => {
    setBenefitExpenses(prev => [...prev, { ...expense, id: crypto.randomUUID(), paid: false }]);
  }, []);
  const removeBenefitExpense = useCallback((id: string) => {
    setBenefitExpenses(prev => prev.filter(e => e.id !== id));
  }, []);
  const toggleBenefitExpensePaid = useCallback((id: string) => {
    setBenefitExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e));
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

  const filterByMonth = (expenses: (Expense | BenefitExpense)[], year: number, month: number) =>
    expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

  const getCardTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(cardExpenses, year, month).reduce((sum, e) => sum + e.value, 0), [cardExpenses]);
  const getCardUnpaidTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(cardExpenses, year, month).filter(e => !e.paid).reduce((sum, e) => sum + e.value, 0), [cardExpenses]);

  const getExpensesTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(generalExpenses, year, month).reduce((sum, e) => sum + e.value, 0), [generalExpenses]);
  const getExpensesUnpaidTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(generalExpenses, year, month).filter(e => !e.paid).reduce((sum, e) => sum + e.value, 0), [generalExpenses]);

  const getBenefitsTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(benefitExpenses, year, month).reduce((sum, e) => sum + e.value, 0), [benefitExpenses]);
  const getBenefitsUnpaidTotalByMonth = useCallback((year: number, month: number) =>
    filterByMonth(benefitExpenses, year, month).filter(e => !e.paid).reduce((sum, e) => sum + e.value, 0), [benefitExpenses]);

  const getCardExpensesByMonth = useCallback((year: number, month: number) =>
    filterByMonth(cardExpenses, year, month) as Expense[], [cardExpenses]);
  const getGeneralExpensesByMonth = useCallback((year: number, month: number) =>
    filterByMonth(generalExpenses, year, month) as Expense[], [generalExpenses]);
  const getBenefitExpensesByMonth = useCallback((year: number, month: number) =>
    filterByMonth(benefitExpenses, year, month) as BenefitExpense[], [benefitExpenses]);

  const getAllMonths = useCallback(() => {
    const all = [...cardExpenses, ...generalExpenses, ...benefitExpenses, ...incomes.map(i => ({ date: i.date }))];
    const set = new Set(all.map(e => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));
    return Array.from(set).map(s => {
      const [y, m] = s.split("-").map(Number);
      return { year: y, month: m };
    }).sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month);
  }, [cardExpenses, generalExpenses, benefitExpenses, incomes]);

  return (
    <FinanceContext.Provider value={{
      cardExpenses, generalExpenses, benefitExpenses, incomes, benefitTotal,
      setBenefitTotal,
      addCardExpense, removeCardExpense, toggleCardExpensePaid,
      addGeneralExpense, removeGeneralExpense, toggleGeneralExpensePaid,
      addBenefitExpense, removeBenefitExpense, toggleBenefitExpensePaid,
      addIncome, removeIncome, updateIncome, updateSalary,
      getSalaryByMonth, getExtraIncomeByMonth, getIncomeTotalByMonth,
      getCardTotalByMonth, getCardUnpaidTotalByMonth,
      getExpensesTotalByMonth, getExpensesUnpaidTotalByMonth,
      getBenefitsTotalByMonth, getBenefitsUnpaidTotalByMonth,
      getCardExpensesByMonth, getGeneralExpensesByMonth, getBenefitExpensesByMonth,
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
